Front end package for capturing backend vuex injection that works with InertiaJS

### Update your Vue instance
```
createInertiaApp({
    resolve: name => {
        const page = require(`./pages/${name}`).default;
        page.layout = MainLayout;
        return page;
    },
    setup({ el, App, props, plugin }) {
        Vue.use(plugin);
        
        new Vue({
            modals,
            store,
            mounted() {
                hydrateWatch(this, store);
            },
            render: h => h(App, props)
        }).$mount(el);
    },
});
```
The `mounted()` event is where it all happens - it calls the hydration method to monitor for inertia props.

### How to inject vuex data in your render calls
```
Vuex::load('user', 'profile');

return Inertia::render('Page/Example', [
    '$vuex' => Vuex::toJson()
]);
```