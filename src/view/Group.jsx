import React from 'react'
import UUID from 'uuid'
import i18n from 'i18n'
import { ipcRenderer } from 'electron'
import { TweenMax } from 'gsap'
import { IconButton } from 'material-ui'
import PhotoIcon from 'material-ui/svg-icons/image/photo'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

import Base from './Base'
import FlatButton from '../common/FlatButton'
import { combineElement, removeElement } from '../common/array'
import Groups from '../box/Groups'

/* increase limit of listeners of EventEmitter */
ipcRenderer.setMaxListeners(1000)

class Group extends Base {
  constructor(ctx) {
    super(ctx)
    this.state = {
      tweets: [],
      boxes: null,
      currentBox: null
    }

    this.getTweets = (args) => {
      this.setState({ currentBox: null })
      this.ctx.props.apis.pureRequest('tweets', { boxUUID: args.boxUUID }, (err, res) => {
        if (!err && res && res.body) this.setState({ tweets: res.body, currentBox: args.boxUUID })
        else console.log('get tweets error', err, res && res.body)
      })
    }

    this.processBox = (d) => {
      if (!d || !d[0]) return []
      d.forEach((b) => {
        b.ltime = b.ctime
        b.lcomment = Array.from({ length: Math.random() * 10 })
          .map(() => String.fromCharCode(0x674e - Math.random() * 100))
      })
      d.sort((a, b) => (b.ltime - a.ltime))
      return d
    }

    this.refresh = () => {
      this.ctx.props.apis.pureRequest('boxes', null, (err, res) => {
        console.log('boxes', err, res && res.body)
        if (!err && res && res.body) this.setState({ boxes: this.processBox(res.body) })
        if (!err && res && res.body && res.body[0]) this.getTweets({ boxUUID: res.body[0].uuid })
      })
    }
  }

  willReceiveProps(nextProps) {
    this.handleProps(nextProps.apis, ['boxToken'])
  }

  navEnter() {
    const a = this.ctx.props.apis.account
    this.guid = a && a.data && a.data.global && a.data.global.id

    this.ctx.props.apis.request('boxToken', { guid: this.guid }, this.refresh)
  }

  navLeave() {
  }

  navGroup() {
    return 'box'
  }

  menuName() {
    return i18n.__('Group Menu Name')
  }

  menuIcon() {
    return PhotoIcon
  }

  quickName() {
    return i18n.__('Group Quick Name')
  }

  appBarStyle() {
    return 'colored'
  }

  hasDetail() {
    return true
  }

  detailEnabled() {
    return true
  }

  renderContent({ openSnackBar }) {
    return (<Groups
      {...this.state}
      ipcRenderer={ipcRenderer}
      apis={this.ctx.props.apis}
      primaryColor={this.groupPrimaryColor()}
      getTweets={this.getTweets}
      openSnackBar={openSnackBar}
      refresh={this.refresh}
      guid={this.guid}
    />)
  }
}

export default Group