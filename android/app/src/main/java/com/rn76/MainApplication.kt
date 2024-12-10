package com.rn76

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import fi.iki.elonen.NanoHTTPD
import android.util.Log 
import kotlin.random.Random
import org.json.JSONObject

fun generateRandomString(length: Int): String {
    val allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return (1..length)
        .map { allowedChars.random() }
        .joinToString("")
}

class MainApplication : Application(), ReactApplication {
  private var server: NanoHTTPD? = null
  val smallRandomString = generateRandomString(100)
  val mediumRandomString = generateRandomString(10000)
  val bigRandomString = generateRandomString(1000000)

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }

    server = object : NanoHTTPD(36666) {
      override fun serve(session: IHTTPSession): Response {
          val uri = session.uri
          return when (uri) {
              "/small" -> {
                val json = JSONObject()
                json.put("message", "pong")
                json.put("testData", smallRandomString)
                newFixedLengthResponse(json.toString())
              }
              "/medium" -> {
                val json = JSONObject()
                json.put("message", "pong")
                json.put("testData", mediumRandomString)
                newFixedLengthResponse(json.toString())
              }
              "/big" -> {
                val json = JSONObject()
                json.put("message", "pong")
                json.put("testData", bigRandomString)
                newFixedLengthResponse(json.toString())
              }
              else -> newFixedLengthResponse("Default response")
          }
      }
    }

    try {
        server?.start()
        Log.d("MyWebServer", "Server started on port 8080")
    } catch (e: Exception) {
        Log.e("MyWebServer", "Failed to start server", e)
    }
  }
}
