import { InitializedVuexStore, VuexcellentOptions, VuexStore, VuexModule, IPhaseLogger } from "@pderas/vuex-hydrate-state";
import { loggingMerge, objectMerge } from "./objectMerge";
import { mutantGenerator } from "./mutations";
import { VuexcellentAutoCommitter, autoCommitData } from "./committer";
import { AxiosInstance } from "axios";
import { createLogger } from './logger'

declare var context: {
  __PHASE_STATE__?: VuexStore
  axios?: AxiosInstance
};

declare global {
    var __BROWSER__: boolean
    var __PHASE_STATE__: VuexStore
    var axios: AxiosInstance
}

globalThis.__BROWSER__ = typeof window !== 'undefined'
const isServer = typeof context !== 'undefined'
const globalBase = isServer ? context : globalThis

const defaultOptions = <VuexcellentOptions>{
  generateMutations: true,
  axios: globalBase.axios,
  mutationPrefix: `X_SET`,
  logLevel: 'emergency',
  logger: createLogger('emergency')
};

export const hydrate = (vuexState: VuexStore, options: VuexcellentOptions = defaultOptions) => {
  let __PHASE_STATE__ = globalBase.__PHASE_STATE__ ?? {}

  options = {
    ...defaultOptions,
    ...options
  }
  const logger = options.logger = createLogger(options.logLevel)
  logger.debug(`[Phase] Initiating Logger: ${options.logLevel}`)
  logger.debug(`[Phase] Initial Options:`, options)

  // PHP Converts the empty array to a... empty array, booo
  if (Array.isArray(__PHASE_STATE__) && !__PHASE_STATE__.length) {
    logger.debug('[Phase] Missing State. Forcing to Initial state to be empty object.')
    __PHASE_STATE__ = {}
  }

  // Currently not running actions/mutations on page load
  const { mutations, actions, ...phaseState } = __PHASE_STATE__

  // merge incoming (store) options with window.__PHASE_STATE__
  const mergedState = loggingMerge(logger, vuexState, <VuexStore>phaseState);

  // generate mutations
  const { createMutant, getMutation } = mutantGenerator(options);
  const newState = options.generateMutations
    ? createMutant(mergedState)
    : mergedState;

  logger.info(`[Phase] State Merged, Mutations Generated`, newState)
  if (options.axios && options.generateMutations && __BROWSER__) {
    // prepare plugin
    const VuexcellentPlugins = VuexcellentAutoCommitter(
      options,
      newState,
      getMutation
    );

    newState.plugins = [
        // inject plugin
        ...VuexcellentPlugins,
        ...(newState.plugins ?? [])
      ];

  } else if (options.generateMutations) {
    logger.error(
      "[VuexHydrate] It appears that auto-mutate could not be initialized.\nAn instance of axios could not be found. Make sure window.axios is available"
    );
  }

  return newState;
};

export const hydrateWatch = (
  _this: any, 
  store: InitializedVuexStore,
  options: VuexcellentOptions = defaultOptions,
  logger: IPhaseLogger
) => {
  const inertia = _this.$inertia.page.props;
  if (inertia && inertia.$vuex) {
    let __PHASE_STATE__ = globalBase.__PHASE_STATE__ ?? {}

  // Currently not running actions/mutations on page load
  const { mutations, actions, ...phaseState } = __PHASE_STATE__
  const vuexState = _this.$store._modules.root._rawModule;

  // merge incoming (store) options with window.__PHASE_STATE__
  const mergedState = loggingMerge(logger, vuexState, <VuexStore>phaseState);

  // generate mutations
  const { createMutant, getMutation } = mutantGenerator(options);
  const newState = options.generateMutations
    ? createMutant(mergedState)
    : mergedState;
    
    autoMutateInertiaInterceptor(inertia, _this.$store, newState, getMutation);
  }
}

/**
 * Axios interceptor Generator to automatically call mutations
 * and commit changed data. Sets up interceptor
 *
 * @param {Object} response the vuex response
 * @param {Object} store initialized vuex store
 * @param {Object} _state raw vuex starting data
 * @param {Function} mutator function name generator
 * @param {Object} options default options
 *
 * @return void
 */
 const autoMutateInertiaInterceptor = (
  response: any,
  store: InitializedVuexStore,
  _state: VuexModule,
  mutator: any,
  options: VuexcellentOptions = defaultOptions, 
) => {

  const logger = options.logger = createLogger(options.logLevel)

  if (!response.$vuex) {
    logger.debug("[VuexHydrate] no vuex data detected. Skipping auto mutations.")
    return response;
  }

  logger.debug("[VuexHydrate] vuex data detected, attempting to auto-commit")

  try {
    let $vuex = JSON.parse(response.$vuex);
    // grab state & modules, if existing & auto-commit
    autoCommitData({ store, _state, mutator }, $vuex, logger);

    // user specified mutations
    ($vuex.mutations || []).forEach(
      ([mutation, value]: [string, any?]) => store.commit(mutation, value)
    );

    // user specified actions
    ($vuex.actions || []).forEach(
      ([action, value]: [string, any?]) => store.dispatch(action, value)
    );
  } catch (err) {
    logger.error(err);
    logger.warning(
      `[@pderas/vuex-hydrate-state] An error occurred during the auto commit process.\nYour vuex state may not be what you expected.`
    );
  }
};