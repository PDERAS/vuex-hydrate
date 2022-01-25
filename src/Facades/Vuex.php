<?php

namespace Pderas\VuexHydrate\Facades;

use Illuminate\Support\Facades\Facade;
use Pderas\VuexHydrate\Factories\VuexFactory;

class Vuex extends Facade {
    protected static function getFacadeAccessor()
    {
        return VuexFactory::class;
    }
}
