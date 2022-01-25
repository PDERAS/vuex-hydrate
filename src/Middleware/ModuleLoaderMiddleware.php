<?php

namespace Pderas\VuexHydrate\Middleware;

use Closure;
use Pderas\VuexHydrate\Facades\Vuex;

class ModuleLoaderMiddleware
{
    public function handle($request, Closure $next, ...$selectors)
    {
        collect(explode('|', implode(',', $selectors)))->each(function ($selectors) {
            $args = explode(',', $selectors);
            $module = array_shift($args);
            $key = array_shift($args);
            Vuex::load($module, [$key => $args]);
        });

        return $next($request);
    }
}
