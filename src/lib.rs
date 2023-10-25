extern crate console_error_panic_hook;
use rhai::{Engine, Scope};
use wasm_bindgen::prelude::*;
use rhai::packages::{CorePackage, Package};
use rhai::packages::BasicArrayPackage;

#[wasm_bindgen]
pub fn resolve_if(script: &str, data: &JsValue) -> Result<bool, String> {
    console_error_panic_hook::set_once();

    let mut engine = Engine::new_raw();

    let core_package = CorePackage::new();
    let array_package = BasicArrayPackage::new();
    core_package.register_into_engine(&mut engine);
    array_package.register_into_engine(&mut engine);

    let mut scope = Scope::new();

    let keys = match js_sys::Reflect::own_keys(data) {
        Ok(res) => res,
        Err(e) => return Err(e.as_string().unwrap())
    };

    for key in keys {
        let value = match js_sys::Reflect::get(data, &key) {
            Ok(res) => res,
            Err(e) => return Err(e.as_string().unwrap())
        };

        let k = key.as_string().unwrap();
        if value.as_bool().is_some() {
            scope.push(k, value.as_bool().unwrap());
        } else if value.as_f64().is_some() {
            scope.push(k, value.as_f64().unwrap());
        } else if value.as_string().is_some() {
            scope.push(k, value.as_string().unwrap());
        }
    }

    let altered = script.replace("'", "\"");

    let result = match engine.eval_expression_with_scope::<bool>(&mut scope, &altered) {
        Ok(res) => res,
        Err(e) => return Err(e.to_string())
    };
    Ok(result)
}
