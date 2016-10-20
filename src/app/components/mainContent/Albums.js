/**
  相册
**/

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'

import NavigationBar from '../main/NavigationBar';
import AlbumItem from './AlbumItem';
import AlbumPhotoItem from '../common/AlbumPhotoItem';
import AddAlbumTopicDialog from '../common/Dialog';
import AddAlbumPhotoListDialog from '../common/Dialog';
import Input from '../../React-Redux-UI/src/components/partials/Input';
import Textarea from '../../React-Redux-UI/src/components/partials/Textarea';
import Button from '../../React-Redux-UI/src/components/partials/Button';
import AllPhotos from './AllPhotos';
import { formatDate } from '../../utils/datetime';
import Carousel from '../../React-Redux-UI/src/components/transitions/Carousel';
import Mask from '../../React-Redux-UI/src/components/partials/Mask';
import ImageSwipe from '../common/ImageSwipe';
import { MenuItem } from 'material-ui';

import svg from '../../utils/SVGIcon';
import Action from '../../actions/action';

function getStyles () {
  return {
    list: {
      marginLeft: -5,
      paddingTop: 52
    },
    add: {
      bottom: 140,
      backgroundColor: '#e54387',
      borderRadius: '100%',
      color: '#fff',
      fontSize: 30,
      height: 40,
      lineHeight: '40px',
      position: 'fixed',
      right: 50,
      textAlign: 'center',
      width: 40
    },
    input: {
      border: 0,
      border: '1px solid #e0e0e0',
      color: 'rgba(0,0,0,.87)',
      display: 'block',
      fontSize: 12,
      marginBottom: 24,
      padding: 10,
      width: '100%',
      boxSizing: 'border-box',
      resize: 'none'
    },
    button: {
      backgroundColor: '#37abb5',
      color: '#fff',
      fontSize: 12,
      height: 35,
      lineHeight: '35px',
      marginLeft: 10,
      width: 60,
    }
  }
}

class Albums extends Component {
  constructor() {
    super();

    this.state = {
      addAlbumIconShowedStatus: true,
      addAlbumTopicDialogShowedStatus: false,
      addAlbumPhotoListDialogShowedStatus: false
    }
  }

  createNavigationBar() {
    const { dispatch, navigationBarTitleTexts } = this.props;

    return (
      <NavigationBar
        dispatch={ dispatch }
        navigationBarTitleTexts={ navigationBarTitleTexts }
        navigationBarHorizontalPadding={ 18 }>
      </NavigationBar>
    );
  }

  clearAllSelectedItem() {
    const { dispatch } = this.props;

    dispatch(Action.clearDragImageItem());
  }

  viewLargeImageHandle(date, currentThumbIndex) {
    const { dispatch } = this.props;

    dispatch(Action.getLargeImageList(document.querySelectorAll('[data-date="'+ date +'"]'), currentThumbIndex, date));
  }

  selectAlbumPhotoItemHandle(index, el, date, checked) {
    const { dispatch } = this.props;

    if (checked) {
      Object
        .keys(this.refs)
        .forEach(key => this.refs[key].setState({ selectStatus: 'over' }));

      setTimeout(() => {
        dispatch(Action.addDragImageItem(el, date, index));
      }, 0);
    } else {
      dispatch(Action.removeDragImageItem(date, index));
    }
  }

  getPhotoList() {
    const { media } = this.props;
    return media.data.slice(0, 100).filter(l => !!l.exifDateTime);
  }

  getDialogClientRect() {
    const leftSidebarWidth = 220;
    const rectWidth = window.innerWidth - leftSidebarWidth;
    const paddingHorizontal = 36;
    const dialogWidth = rectWidth - paddingHorizontal;

    return {
      width: dialogWidth,
      left: parseInt((rectWidth - dialogWidth) / 2) + leftSidebarWidth
    };
  }

  createAlbumItems() {
    const { media, dispatch, login } = this.props;

    return media.mediaShare.map(album => {
      if (album.doc.album) {
        return (
          <AlbumItem key={ album.digest } info={ album } dispatch={ dispatch } login={ login }></AlbumItem>
        );
      }
    });
  }

  createAddAlbumIcon() {
    const { add } = getStyles();

    return (
      <div style={ add } onClick={ this.toggleShowed.bind(this) }>+</div>
    );
  }

  createAddAlbumPhotoListDialog() {
    const dialogRect = this.getDialogClientRect();

    return (
      <AddAlbumPhotoListDialog
        caption="新建相册"
        content={ this.createAddAlbumPhotoListDialogContent() }
        foot={ this.createAddAlbumPhotoListDialogFoot() }
        style={{ left: 0, top: 0, width: '100%', transform: 'inherit', zIndex: 1200 }}
        orientation="custom"
        onClose={ this.toggleShowed.bind(this, 'addAlbumPhotoListDialogShowedStatus') }>
      </AddAlbumPhotoListDialog>
    );
  }

  createAddAlbumPhotoListDialogContent() {
    const photoList = this.getPhotoList();

    return (
      <div style={{ position: 'fixed', top: 64, bottom: 55, width: '100%', backgroundColor: '#fff', overflow: 'auto', boxSizing: 'border-box', padding: '10px 0 0 10px', boxSizing: 'border-box' }}>
        {
          photoList.map((photo, index) =>
            <AlbumPhotoItem
              dataIndex={ index }
              isViewAllPhoto={ true }
              date={ formatDate(photo.exifDateTime) }
              key={ photo.digest }
              digest={ photo.digest }
              path={ photo.path }
              onViewLargeImage={ this.viewLargeImageHandle.bind(this) }
              onSelect={ this.selectAlbumPhotoItemHandle.bind(this) }>
            </AlbumPhotoItem>
          )
        }
      </div>
    );
  }

  createAddAlbumPhotoListDialogFoot() {
    let { button } = getStyles();
    button = Object.assign({}, button, { margin: '10px 10px 10px 0' })

    return (
      <div className="clearfix" style={{ position: 'fixed', bottom: 0, height: 55, left: 0, width: '100%', backgroundColor: '' }}>
        <div className="fr">
          <Button
            className="cancel-btn"
            style={ button }
            clickEventHandle={ this.toggleShowed.bind(this, 'addAlbumTopicDialogShowedStatus', true) }
            text="下一步">
          </Button>
        </div>
      </div>
    );
  }

  createAddAlbumTopicDialog() {
    const dialogRect = this.getDialogClientRect();

    return (
      <AddAlbumTopicDialog
        caption="新建相册"
        content={ this.createAlbumTopicDialogContent() }
        style={{ left: dialogRect.left, width: dialogRect.width, WebkitTransform: 'translateY(-50%)' }}
        foot={ this.createAlbumTopicDialogFoot() }
        orientation="custom"
        onClose={ this.toggleShowed.bind(this, 'addAlbumTopicDialogShowedStatus') }>
      </AddAlbumTopicDialog>
    );
  }

  createAlbumTopicDialogContent() {
    let { dialogContent, input } = getStyles();
    dialogContent = Object.assign({}, dialogContent, { boxSizing: 'border-box', padding: '40px 80px' });

    return (
      <div style={ dialogContent }>
        <Input
          placeholder="请输入相册名称"
          style={ input }>
        </Input>
        <Textarea
          placeholder="请输入描述"
          style={ input }>
        </Textarea>
      </div>
    );
  }

  createAlbumTopicDialogFoot() {
    const { button } = getStyles();

    return (
      <div className="clearfix">
        <div className="fr" style={{ margin: '10px 10px 10px 0' }}>
          <Button
            className="cancel-btn"
            style={ button }
            clickEventHandle={ this.toggleShowed.bind(this, 'addAlbumTopicDialogShowedStatus') }
            text="取消">
          </Button>
          <Button
            className="cancel-btn"
            style={ button }
            clickEventHandle={ this.toggleShowed.bind(this, 'addAlbumTopicDialogShowedStatus') }
            text="确定">
          </Button>
        </div>
      </div>
    );
  }

  submitAddAlbumHandle() {

  }

  toggleShowed(mark, isSwitch) {
    const showedDialogState = {};

    if (isSwitch === true) {
      if (mark !== 'addAlbumPhotoListDialogShowedStatus') {
        showedDialogState['addAlbumIconShowedStatus'] = false;
        showedDialogState[mark] = true;
        const specialKey = Object.keys(this.state).find(key => key !== 'addAlbumIconShowedStatus' && key !== mark);
        showedDialogState[specialKey] = false;
      } else {
        showedDialogState['addAlbumTopicDialogShowedStatus'] = true;
        showedDialogState['addAlbumPhotoListDialogShowedStatus'] = false;
        showedDialogState['addAlbumTopicDialogShowedStatus'] = false;
      }
    } else if (typeof mark === 'string') {
      showedDialogState['addAlbumIconShowedStatus'] = true;
      showedDialogState[mark] = false;
    } else {
      showedDialogState['addAlbumIconShowedStatus'] = false;
      showedDialogState['addAlbumPhotoListDialogShowedStatus'] = true;
      showedDialogState['addAlbumTopicDialogShowedStatus'] = false;
    }

    this.setState(showedDialogState);
  }

  render() {
    const { list } = getStyles();

    return (
      <div className="album-container">
        {/* navigationbar */}
        { this.createNavigationBar() }

        {/* 相册列表 */}
        <div className="album-list clearfix" style={ list }>
          { this.createAlbumItems() }
        </div>

        {/* add icon */}
        { this.state.addAlbumIconShowedStatus && this.createAddAlbumIcon() }

        {/* 新建相册主题对话框 */}
        { this.state.addAlbumTopicDialogShowedStatus && this.createAddAlbumTopicDialog() }

        {/* 新建相册所有照片对话框 */}
        { this.state.addAlbumPhotoListDialogShowedStatus && this.createAddAlbumPhotoListDialog() }
      </div>
    );
  }

  componentWillUnmount() {
    this.clearAllSelectedItem();
  }
}

var mapStateToProps = (state)=>({
       //state: state,
     media: state.media,
     navigationBarTitleTexts: state.navigationBarTitleTexts,
     login:state.login
})

export default connect(mapStateToProps)(Albums);