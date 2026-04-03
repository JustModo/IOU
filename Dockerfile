FROM node:20-bullseye

ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH

# System deps
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget unzip git \
    && rm -rf /var/lib/apt/lists/*

# Android SDK (cached layer)
RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
    cd /tmp && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O sdk.zip && \
    unzip sdk.zip -d cmdline-tools && \
    mkdir -p $ANDROID_SDK_ROOT/cmdline-tools/latest && \
    mv cmdline-tools/cmdline-tools/* $ANDROID_SDK_ROOT/cmdline-tools/latest/

RUN yes | sdkmanager --licenses

RUN sdkmanager \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0" \
    "platforms;android-34" \
    "build-tools;34.0.0"

# Expo tooling
RUN npm install -g eas-cli

WORKDIR /app