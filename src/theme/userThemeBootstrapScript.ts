import { getUserThemeCssVariables } from "./userThemeCssVariables";
import {
  defaultUserThemeKey,
  type UserThemeKey,
  userThemeKeys,
} from "./userThemeTokens";
import {
  getUserThemeStorageKey,
  lastUserThemeStorageKey,
  legacyUserThemeStorageKey,
  userThemeScopedStorageKeyPrefix,
} from "./userThemeStorage";

const anonymousUserThemeStorageKey = getUserThemeStorageKey("anonymous");

const userThemeCssVariablesByKey = Object.fromEntries(
  userThemeKeys.map((themeKey) => [
    themeKey,
    getUserThemeCssVariables(themeKey),
  ]),
) as Record<UserThemeKey, ReturnType<typeof getUserThemeCssVariables>>;

const userThemeBootstrapScript = `(function(){try{var themes=${serializeForInlineScript(
  userThemeCssVariablesByKey,
)};var keys=${serializeForInlineScript(userThemeKeys)};var fallback=${JSON.stringify(
  defaultUserThemeKey,
)};var storageKeys=${serializeForInlineScript([
  anonymousUserThemeStorageKey,
  lastUserThemeStorageKey,
  legacyUserThemeStorageKey,
])};var valid=function(value){return keys.indexOf(value)!==-1};var read=function(key){var value=window.localStorage.getItem(key);return valid(value)?value:null};var themeKey=null;for(var i=0;i<storageKeys.length;i++){themeKey=read(storageKeys[i]);if(themeKey){break}}if(!themeKey){var found=[];for(var j=0;j<window.localStorage.length;j++){var key=window.localStorage.key(j);if(!key||key.indexOf(${JSON.stringify(
  userThemeScopedStorageKeyPrefix,
)})!==0){continue}var value=read(key);if(value&&found.indexOf(value)===-1){found.push(value)}}if(found.length===1){themeKey=found[0]}}themeKey=themeKey||fallback;var root=document.documentElement;root.setAttribute("data-user-theme",themeKey);var variables=themes[themeKey]||themes[fallback];for(var name in variables){root.style.setProperty(name,variables[name])}}catch(error){}})();`;

export function createUserThemeBootstrapScript() {
  return userThemeBootstrapScript;
}

function serializeForInlineScript(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
