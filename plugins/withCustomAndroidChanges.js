const { withGradleProperties, withAndroidManifest, withProjectBuildGradle } = require("expo/config-plugins");

module.exports = function withCustomAndroidChanges(config) {
  // 1. Gradle Properties
  config = withGradleProperties(config, (config) => {
    // Add parallel build property
    const hasParallel = config.modResults.find(p => p.key === "org.gradle.parallel");
    if (!hasParallel) {
      config.modResults.push({ type: "property", key: "org.gradle.parallel", value: "true" });
    } else {
      hasParallel.value = "true";
    }

    // Add configuration-cache property
    const hasConfigCache = config.modResults.find(p => p.key === "org.gradle.configuration-cache");
    if (!hasConfigCache) {
      config.modResults.push({ type: "property", key: "org.gradle.configuration-cache", value: "false" });
    } else {
      hasConfigCache.value = "false";
    }

    return config;
  });

  // 2. Android Manifest
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest;
    if (!mainApplication["uses-permission"]) {
      mainApplication["uses-permission"] = [];
    }
    const hasExactAlarm = mainApplication["uses-permission"].some(
      (p) => p.$["android:name"] === "android.permission.SCHEDULE_EXACT_ALARM"
    );
    if (!hasExactAlarm) {
      mainApplication["uses-permission"].push({
        $: { "android:name": "android.permission.SCHEDULE_EXACT_ALARM" },
      });
    }
    return config;
  });

  // 3. Project build.gradle (Notifee Maven Repo)
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
       let buildGradle = config.modResults.contents;
       const mavenRepo = `        maven {\n            // Notifee Android binaries are distributed inside the npm package.\n            url(new File(['node', '--print', "require.resolve('@notifee/react-native/package.json')"].execute(null, rootDir).text.trim(), '../android/libs'))\n        }`;
       
       if (!buildGradle.includes("notifee")) {
         // Insert into allprojects { repositories { ... } }
         buildGradle = buildGradle.replace(
           /allprojects\s*\{\s*repositories\s*\{/,
           `allprojects {\n    repositories {\n${mavenRepo}`
         );
       }
       config.modResults.contents = buildGradle;
    }
    return config;
  });

  return config;
};
