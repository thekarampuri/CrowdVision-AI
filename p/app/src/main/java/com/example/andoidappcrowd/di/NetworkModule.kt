package com.example.andoidappcrowd.di

import com.example.andoidappcrowd.data.api.CrowdVisionApi
import com.example.andoidappcrowd.data.repository.CrowdVisionRepository
import com.example.andoidappcrowd.data.websocket.WebSocketManager
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(
                HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                }
            )
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://localhost:3000/") // Next.js server URL
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideCrowdVisionApi(retrofit: Retrofit): CrowdVisionApi {
        return retrofit.create(CrowdVisionApi::class.java)
    }
    
    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth {
        return FirebaseAuth.getInstance()
    }
    
    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore {
        return FirebaseFirestore.getInstance()
    }
    
    @Provides
    @Singleton
    fun provideWebSocketManager(): WebSocketManager {
        return WebSocketManager()
    }
    
    @Provides
    @Singleton
    fun provideCrowdVisionRepository(
        api: CrowdVisionApi,
        auth: FirebaseAuth,
        firestore: FirebaseFirestore
    ): CrowdVisionRepository {
        return CrowdVisionRepository(api, auth, firestore)
    }
}