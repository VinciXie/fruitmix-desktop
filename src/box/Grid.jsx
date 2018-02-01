import React from 'react'
import i18n from 'i18n'
import { CircularProgress, Paper, Avatar, IconButton, RaisedButton, TextField } from 'material-ui'

import CloseIcon from 'material-ui/svg-icons/navigation/close'
import { AutoSizer } from 'react-virtualized'
import Thumb from '../file/Thumb'
import ScrollBar from '../common/ScrollBar'


class Grid extends React.Component {
  constructor(props) {
    super(props)
  }

  renderGrid(digest, size) {
    console.log('renderGrid', digest)
    return (
      <div style={{ width: size, height: size, margin: 5 }}>
        <Thumb
          digest={digest}
          ipcRenderer={this.props.ipcRenderer}
          height={size}
          width={size}
        />
      </div>
    )
  }

  renderRow({ index, key, style }) {
    const { items, size, num } = this.props
    console.log('renderRow', this.props)
    const f = index * num
    return (
      <div style={style} key={key}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { [f, f + 1, f + 2].map(i => items[i]).filter(i => !!i).map(d => this.renderGrid(d, size)) }
        </div>
      </div>
    )
  }

  render() {
    const { items, size, num } = this.props
    const rowCount = Math.ceil(items.length / num)
    const rowHeight = size + 10
    console.log('Grid.jsx', this.props)

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <ScrollBar
              style={{ outline: 'none' }}
              allHeight={rowCount * rowHeight}
              height={height}
              width={width}
              rowCount={rowCount}
              rowHeight={rowHeight}
              rowRenderer={({ index, key, style }) => this.renderRow({ index, key, style })}
            />
          )}
        </AutoSizer>
      </div>
    )
  }
}

export default Grid