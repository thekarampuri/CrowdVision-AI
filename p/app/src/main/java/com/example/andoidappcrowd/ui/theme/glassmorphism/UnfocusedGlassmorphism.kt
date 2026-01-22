package com.example.andoidappcrowd.ui.theme.glassmorphism

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

fun Modifier.unfocusedGlassmorphism(blur: Dp = 20.dp) = this
    .shadow(
        elevation = 2.dp,
        shape = RoundedCornerShape(32.dp),
        clip = true,
        ambientColor = Color(0x1AFFFFFF),
        spotColor = Color(0x40FFFFFF)
    )
    .background(color = Color(0x33FFFFFF))
    .border(
        width = 1.dp,
        brush = Brush.verticalGradient(
            colors = listOf(Color(0x80FFFFFF), Color.Transparent),
            startY = 0f,
            endY = 50f
        ),
        shape = RoundedCornerShape(32.dp)
    )
