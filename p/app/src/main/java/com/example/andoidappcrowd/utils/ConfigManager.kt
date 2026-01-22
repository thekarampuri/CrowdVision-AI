package com.example.andoidappcrowd.utils

import android.content.Context
import com.google.gson.Gson
import com.google.gson.JsonObject
import java.io.IOException

class ConfigManager(private val context: Context) {
    
    private val gson = Gson()
    
    fun getFirebaseConfig(): JsonObject? {
        return try {
            val jsonString = readJsonFromAssets("config.json")
            val jsonObject = gson.fromJson(jsonString, JsonObject::class.java)
            jsonObject.getAsJsonObject("firebase")
        } catch (e: Exception) {
            null
        }
    }
    
    fun getApiConfig(): JsonObject? {
        return try {
            val jsonString = readJsonFromAssets("config.json")
            val jsonObject = gson.fromJson(jsonString, JsonObject::class.java)
            jsonObject.getAsJsonObject("api")
        } catch (e: Exception) {
            null
        }
    }
    
    private fun readJsonFromAssets(fileName: String): String {
        return try {
            context.assets.open(fileName).use { inputStream ->
                inputStream.bufferedReader().use { reader ->
                    reader.readText()
                }
            }
        } catch (e: IOException) {
            throw RuntimeException("Error reading asset file: $fileName", e)
        }
    }
}