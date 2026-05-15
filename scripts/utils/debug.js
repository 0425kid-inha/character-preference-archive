import { state } from "../core/state.js";

export function registerDebugTools() {
  window.printState = function () {
    console.log("현재 state:", state);
    return state;
  };
}