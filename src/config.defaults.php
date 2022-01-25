<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Determines whether to use the vuex state integration
    |--------------------------------------------------------------------------
    |
    | By default state management will be integrated if the Phased\State package
    | has been installed
    */
    'state' => class_exists('\Pderas\VuexHydrate\Facades\Vuex'),

    /*
    |--------------------------------------------------------------------------
    | Window key to save the initial state
    |--------------------------------------------------------------------------
    |
    | This is where the state will be stored on page load,
    | (If state integration is enabled of course)
    */
    'initial_state_key' => '__PHASE_STATE__',

    /*
    |--------------------------------------------------------------------------
    | <script id=initial_state_id />
    |--------------------------------------------------------------------------
    |
    | This is the id save to the state <script /> tag. Useful for removing the
    | <script> tag after load, or customizing in the event of name collisions
    */
    'initial_state_id' => 'phase-state',
];
