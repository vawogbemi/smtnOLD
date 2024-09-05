
export function statusToString(status: number) {
    switch (status) {
      case 0:
        return "Created";
      case 1:
        return "Confirmed";
      case 2:
        return "In Transit";
      case 3:
        return "Arrived";
      case 4:
        return "Recipients Notified";
      default:
        return "Unknown";
    }
  }