package com.tricommits.crowdvisionmobile.ui.alert

import android.os.Parcel
import android.os.Parcelable

data class Alert(
    val id: String,
    val cameraName: String,
    val severity: String,
    val timestamp: String,
    val status: String,
    val description: String?,
    val latitude: Double,
    val longitude: Double,
    val acknowledgedAt: String? = null,
    val cameraId: String? = null,
    val location: String? = null,
    val peopleCount: Int? = null,
    val resolvedAt: String? = null,
    val title: String? = null,
    val createdAt: Long? = null,
    val assignedAt: Long? = null,
    val reachedAt: Long? = null,
    val assignedRescuer: String? = null
) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString(),
        parcel.readDouble(),
        parcel.readDouble(),
        parcel.readString(),
        parcel.readString(),
        parcel.readString(),
        parcel.readValue(Int::class.java.classLoader) as? Int,
        parcel.readString(),
        parcel.readString(),
        parcel.readValue(Long::class.java.classLoader) as? Long,
        parcel.readValue(Long::class.java.classLoader) as? Long,
        parcel.readValue(Long::class.java.classLoader) as? Long,
        parcel.readString()
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(id)
        parcel.writeString(cameraName)
        parcel.writeString(severity)
        parcel.writeString(timestamp)
        parcel.writeString(status)
        parcel.writeString(description)
        parcel.writeDouble(latitude)
        parcel.writeDouble(longitude)
        parcel.writeString(acknowledgedAt)
        parcel.writeString(cameraId)
        parcel.writeString(location)
        parcel.writeValue(peopleCount)
        parcel.writeString(resolvedAt)
        parcel.writeString(title)
        parcel.writeValue(createdAt)
        parcel.writeValue(assignedAt)
        parcel.writeValue(reachedAt)
        parcel.writeString(assignedRescuer)
    }

    override fun describeContents(): Int {
        return 0
    }

    companion object CREATOR : Parcelable.Creator<Alert> {
        override fun createFromParcel(parcel: Parcel): Alert {
            return Alert(parcel)
        }

        override fun newArray(size: Int): Array<Alert?> {
            return arrayOfNulls(size)
        }
    }
}
