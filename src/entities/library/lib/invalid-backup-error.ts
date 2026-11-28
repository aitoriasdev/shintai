/** A backup whose entries Shintai can't read. The import is all or nothing, so nothing was imported. */
export class InvalidBackupError extends Error {
  constructor() {
    super('The backup has entries that are not valid library entries')
    this.name = 'InvalidBackupError'
  }
}
