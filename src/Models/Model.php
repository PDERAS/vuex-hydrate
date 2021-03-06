<?php

namespace Pderas\VuexHydrate\Models;

use Pderas\VuexHydrate\Traits\Vuexable;
use Illuminate\Database\Eloquent\Model as BaseModel;

/**
 * This base model comes PreEquipped with Vuexable.
 * If desired all models can the extended from here,
 * instead of adding the trait. No pressure.
 */
class Model extends BaseModel
{
    use Vuexable;
}
