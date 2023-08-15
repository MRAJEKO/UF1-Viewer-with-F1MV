import Colors from '@renderer/modules/Colors'

interface IMessageColorMapping {
  match: string
  color: string
}

export const MessageColorMappings: IMessageColorMapping[] = [
  {
    match: 'DELETED',
    color: Colors.red
  },
  {
    match: 'ABORTED',
    color: Colors.red
  },
  {
    match: 'SUSPENDED',
    color: Colors.red
  },
  {
    match: 'CANCELLED',
    color: Colors.red
  },
  {
    match: 'SAFETY CAR',
    color: Colors.yellow
  },
  {
    match: 'RECOVERY VEHICLE',
    color: Colors.yellow
  },
  {
    match: 'CORRECTION',
    color: Colors.green
  },
  {
    match: 'COMPLETED',
    color: Colors.green
  },
  {
    match: 'DELAYED',
    color: Colors.orange
  },
  {
    match: 'DISABLED',
    color: Colors.red
  },
  {
    match: 'ENABLED',
    color: Colors.green
  },
  {
    match: 'INCIDENT',
    color: Colors.red
  },
  {
    match: 'UNDER INVESTIGATION',
    color: Colors.orange
  },
  {
    match: 'NO FURTHER INVESTIGATION',
    color: Colors.green
  },
  {
    match: 'RESUME',
    color: Colors.green
  },
  {
    match: 'STOP/GO',
    color: Colors.orange
  },
  {
    match: 'PENALTY',
    color: Colors.red
  },
  {
    match: 'STOPPED',
    color: Colors.red
  },
  {
    match: 'WET',
    color: Colors.blue
  },
  {
    match: 'YELLOW',
    color: Colors.yellow
  },
  {
    match: 'GREEN',
    color: Colors.green
  },
  {
    match: 'RED',
    color: Colors.red
  },
  {
    match: 'pink',
    color: Colors.pink
  },
  {
    match: 'BLUE',
    color: Colors.blue
  }
]

// DELETED
// ABORTED
// BLACK
// BLUE
// CANCELLED
// CAR number (TLA)
// CORRECTION
// COMPLETED
// DELAYED
// DISABLED
// ENABLED
// GREEN
// INCIDENT
// UNDER INVESTIGATION
// NO FURTHER INVESTIGATION
// ORANGE
// PINK
// RESUME
// STOP/GO
// STOPPED
// SUSPENDED
// WET
// WHITE
// YELLOW
