const request = require('superagent')
const EventEmitter = require('eventemitter3')

import Request from './Request'

// this module encapsulate most fruitmix apis
class Fruitmix extends EventEmitter {

  constructor(address, userUUID, token) {
    super()

    this.address = address
    this.userUUID = userUUID
    this.token = token

    this.state = {
      address,
      userUUID,
      token,
      request: this.request.bind(this)
    }
  }

  setState(name, nextState) {
    const state = this.state
    this.state = Object.assign({}, state, { [name]: nextState })
    this.emit('updated', state, this.state)
  }

  setRequest(name, props, f, next) {
    if (this[name]) {
      this[name].abort()
      this[name].removeAllListeners()
    }

    this[name] = new Request(props, f)
    this[name].on('updated', (prev, curr) => {
      this.setState(name, curr)

      // console.log(`${name} updated`, prev, curr, this[name].isFinished(), typeof next === 'function')

      if (this[name].isFinished() && next) {
        this[name].isRejected()
          ? next(this[name].reason())
          : next(null, this[name].value())
      }
    })

    // emit
    this.setState(name, this[name].state)
  }

  clearRequest(name) {
    if (this[name]) {
      this[name].abort()
      this[name].removeAllListeners()
      this[name] = null
      this.setState(name, null)
    }
  }

  aget(ep) {
    return request
      .get(`http://${this.address}:3000/${ep}`)
      .set('Authorization', `JWT ${this.token}`)
  }

  apost(ep, data) {
    const r = request
      .post(`http://${this.address}:3000/${ep}`)
      .set('Authorization', `JWT ${this.token}`)

    return typeof data === 'object'
      ? r.send(data)
      : r
  }

  apatch(ep, data) {
    const r = request
      .patch(`http://${this.address}:3000/${ep}`)
      .set('Authorization', `JWT ${this.token}`)

    return typeof data === 'object'
      ? r.send(data)
      : r
  }

  adel(ep) {
    return request
      .del(`http://${this.address}:3000/${ep}`)
      .set('Authorization', `JWT ${this.token}`)
  }

  request(name, args, next) {
    let r

    switch (name) {

      case 'getToken':
        r = request
          .get(`http://${this.address}:3000/token`)
          .auth(args.uuid, args.password)
          .set('Accept', 'application/json')
        break

      case 'account':
        r = this.aget(`users/${args.uuid}`)
        break

      case 'updateAccount':
        r = this.apatch(`users/${args.uuid}`, args)
        break

      case 'users':
        r = this.aget('users')
        break

      case 'drives':
        r = this.aget('drives')
        break

      case 'adminUsers':
        r = this.aget('admin/users')
        break

      case 'adminCreateUser':
        r = this.apost('admin/users', {
          type: 'local',
          username: args.username,
          password: args.password
        })
        break

      case 'adminDrives':
        r = this.aget('drives')
        break

      case 'driveListNavDir':
        r = this.aget(`files/fruitmix/list-nav/${args.dirUUID}/${args.rootUUID}`)
        break

      case 'adminCreateDrive':
        r = this.apost('admin/drives', {
          label: args.label,
          writelist: args.writelist,
          readlist: [],
          shareAllowed: true
        })
        break

      case 'adminUpdateDrive':
        r = this.apatch(`admin/drives/${args.uuid}`, args)
        break

    /** File APIs **/
      case 'listDir':
        r = this.aget(`drives/${args.driveUUID}`)
        break

      case 'listNavDir':
        r = this.aget(`drives/${args.driveUUID}/dirs/${args.dirUUID}/files`)
        break

      case 'mkdir':
        r = this.apost(`drives/${args.driveUUID}`, { parent: args.dirUUID, name: args.dirname })
        break

      case 'renameDir':
        r = this.apatch(`drives/${args.driveUUID}/dirs/${args.dirUUID}`, { name: args.dirname })
        break

      case 'renameFile':
        r = this.apatch(`drives/${args.driveUUID}/dirs/${args.dirUUID}/files/${args.fileUUID}`, { name: args.filename })
        break

      case 'deleteDir':
        r = this.adel(`drives/${args.driveUUID}/dirs/${args.dirUUID}`)
        break

      case 'deleteFile':
        r = this.adel(`drives/${args.driveUUID}/dirs/${args.dirUUID}/files/${args.fileUUID}`)
        break

    /** Ext APIs **/
      case 'extDrives':
        r = this.aget('files/external/fs')
        break

      case 'extListDir':
        r = this.aget(`files/external/fs/${args.path}`)
        break

      case 'extMkdir':
        break

      case 'extRenameDirOrFile':
        break

      case 'extDeleteDirOrFile':
        break

    /** File Transfer API **/
    // ????

    /** File Share API **/
      case 'fileShare':
        r = this.aget('fileshare')
        break

    /** Media Share API **/
      case 'mediaShare':
        r = this.aget('mediashare')
        break

    /** Media API **/
      case 'media':
        r = this.aget('media')
        break

    /** Docker API **/
      case 'docker':
        r = request.get('http://10.10.9.86:3000/server')
        break

      default:
        break
    }

    if (!r) return console.log(`no request handler found for ${name}`)
    this.setRequest(name, args, cb => r.end(cb), next)
  }

  async requestAsync(name, args) {
    return Promise.promisify(this.request).bind(this)(name, args)
  }

  start() {
    this.requestAsync('account', { uuid: this.userUUID }).asCallback((err, account) => {
      if (account) {
        this.request('listNavDir', { drivesUUID: account.home, dirUUID: account.home })
        if (account.isAdmin) {
          this.request('adminUsers')
          this.request('adminDrives')
        }
      }
    })

    this.request('users')
    // this.request('drives')
    this.requestAsync('drives').asCallback((err, drives) => {
      if (drives) {
        const drive = drives[0]
        this.request('listNavDir', { driveUUID: drive.uuid, dirUUID: drive.uuid })
      }
    })
    this.request('fileShare')
    this.request('mediaShare')
    this.request('media')
  }
}

export default Fruitmix
