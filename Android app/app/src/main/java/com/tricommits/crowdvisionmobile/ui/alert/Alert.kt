package com.tricommits.crowdvisionmobile.ui.alert

import android.os.Parcel
import android.os.Parcelable

data class Alert(
    val id: String,
    val cameraName: String,
    val riskLevel: String,
    val timestamp: String,
    val status: String,
    val message: String?,
    val latitude: Double,
    val longitude: Double
) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString()!!,
        parcel.readString(),
        parcel.readDouble(),
        parcel.readDouble()
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(id)
        parcel.writeString(cameraName)
        parcel.writeString(riskLevel)
        parcel.writeString(timestamp)
        parcel.writeString(status)
        parcel.writeString(message)
        parcel.writeDouble(latitude)
        parcel.writeDouble(longitude)
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
