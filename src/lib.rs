extern crate console_error_panic_hook;
use rhai::packages::BasicArrayPackage;
use rhai::packages::{CorePackage, Package};
use rhai::{Engine, Scope};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn resolve_if(script: &str, data: &JsValue) -> Result<bool, String> {
    console_error_panic_hook::set_once();

    let mut engine = Engine::new_raw();

    let core_package = CorePackage::new();
    let array_package = BasicArrayPackage::new();
    core_package.register_into_engine(&mut engine);
    array_package.register_into_engine(&mut engine);

    let mut scope = Scope::new();

    let keys = js_sys::Reflect::own_keys(data).map_err(js_value_to_string)?;

    let mut vars = rhai::Map::new();

    for key in keys {
        let value = js_sys::Reflect::get(data, &key).map_err(js_value_to_string)?;
        let k = key.as_string().unwrap().into();
        if let Some(value) = value.as_bool() {
            vars.insert(k, value.into());
        } else if let Some(value) = value.as_f64() {
            vars.insert(k, value.into());
        } else if let Some(value) = value.as_string() {
            vars.insert(k, value.into());
        }
    }

    scope.push("vars", vars);

    let altered = script.replace("'", "\"");

    engine
        .eval_expression_with_scope::<bool>(&mut scope, &altered)
        .map_err(|e| e.to_string())
}

fn js_value_to_string(value: JsValue) -> String{
    value.as_string().unwrap()
}