export const updateLogs = (newLogs, dataInfo, currentInfo, utcTime, mapFunction) => {
  let newData: any = []
  let modifiedLogs: any = []

  console.log(dataInfo.length, currentInfo.length)

  if (dataInfo.length < currentInfo.length) {
    newData = dataInfo
    modifiedLogs = [...newLogs.filter((log) => log.time <= utcTime)]
  } else if (dataInfo.length > currentInfo.length) {
    const newDataInfo = dataInfo?.filter(
      (message) =>
        !currentInfo?.some(
          (raceControlMessage) => JSON.stringify(raceControlMessage) === JSON.stringify(message)
        )
    )

    newData = [...currentInfo, ...newDataInfo]
    modifiedLogs = [...newLogs, ...newDataInfo.map((mapItem) => mapFunction(mapItem))]
  }

  return { newData, modifiedLogs }
}
