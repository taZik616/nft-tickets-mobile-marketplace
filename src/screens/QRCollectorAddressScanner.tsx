import React, {useRef} from 'react'

import {ethers} from 'ethers'
// import {launchImageLibrary} from 'react-native-image-picker'

import {QRScanner, QRScannerRefType} from 'src/components/QRScanner'
import {useScreenBlockPortrait, useTypedNavigation} from 'src/hooks'

export function QRCollectorAddressScannerScreen() {
  const {navigate, goBack} = useTypedNavigation()
  const scannerRef = useRef<QRScannerRefType>(null)

  useScreenBlockPortrait()
  // const onClickGallery = async () => {
  //   const response = await launchImageLibrary({mediaType: 'photo'})
  //   if (response.assets && response.assets.length) {
  //     const first = response.assets[0]

  //     if (first.uri) {
  //       try {
  //         const data = await QRreader(first.uri)
  //         setCode(data)
  //         const slicedAddress = prepareAddress(data)
  //         if (slicedAddress) {
  //           onGetAddress(slicedAddress)
  //         }
  //       } catch (err) {
  //         console.log(err)
  //       }
  //     }
  //   }
  // }
  const onScanBarcodes = (qrValues: string[]) => {
    // console.log(
    //   JSON.stringify({
    //     address: '0x638C4c657F80a8A99faeca550B733aaae81174ef',
    //     ticketId: 9898789,
    //   }),
    // )
    // "{"address":"0x638C4c657F80a8A99faeca550B733aaae81174ef","ticketId":9898789}"

    // Ищем валидное значение qr кода
    const validQrValue = qrValues.find((qrValue: string) => {
      try {
        const qrObject = JSON.parse(qrValue)

        if (qrObject.address && qrObject.ticketId) {
          if (ethers.utils.isAddress(qrObject.address)) {
            return true
          } else {
            scannerRef.current?.showError('Incorrect address')
          }
        } else {
          scannerRef.current?.showError(
            'The necessary qr code parameters are missing',
          )
        }
      } catch (error) {
        scannerRef.current?.showError('Failed to process qr code')
      }
    }, [])
    if (validQrValue) {
      const {address, ticketId} = JSON.parse(validQrValue)
      // Предлагаем использовать билеты
      console.log(`valid qr: {address: ${address}, ticketId:${ticketId}}`)
    }
  }

  const onChoiceImage = () => {}

  return (
    <QRScanner
      onChoiceImage={onChoiceImage}
      ref={scannerRef}
      onPressBack={goBack}
      onScanBarcodes={onScanBarcodes}
    />
  )
}
