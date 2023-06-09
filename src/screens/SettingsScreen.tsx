import React from 'react'

import {Settings} from 'src/components/Settings'

export function SettingsScreen({navigation}: any) {
  return (
    <Settings
      onPressDisconnect={() => {}}
      onPressEdit={() => {}}
      onPressWallet={() => {}}
      onPressThemes={() => {}}
      onPressBack={navigation.goBack}
    />
  )
}
