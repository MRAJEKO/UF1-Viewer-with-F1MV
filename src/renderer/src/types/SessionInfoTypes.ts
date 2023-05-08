export interface ISessionInfo {
  Meeting: {
    Key: number
    Name: string
    OfficialName: string
    Location: string
    Country: {
      Key: number
      Code: string
      Name: string
    }
    Circuit: {
      Key: number
      ShortName: string
    }
  }
  ArchiveStatus: {
    Status: 'Complete' | 'Generating'
  }
  Key: number
  Type: 'Race' | 'Qualifying' | 'Practice' | string
  Name: string
  StartDate: string
  EndDate: string
  GmtOffset: string
  Path: string
}
