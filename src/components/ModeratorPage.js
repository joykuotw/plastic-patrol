import React, { Component } from 'react';
import { connect } from 'react-redux';

import IconButton from '@material-ui/core/IconButton';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import PageWrapper from './PageWrapper';
import CardComponent from './CardComponent';

import './ModeratorPage.scss';
import * as actions from '../actions';

import dbFirebase from '../dbFirebase';
import config from '../custom/config';

const placeholderImage = process.env.PUBLIC_URL + "/custom/images/logo.svg";

class ModeratorPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      confirmDialogHandleCancel: this.handleCancelDialog,
      confirmDialogHandleOk: null,
      confirmDialogOpen: false,
      zoomDialogOpen: false,
      photoSelected: {}
    };
  }

  componentDidMount() {
    console.debug(this.props);
    this.props.startFetchingPhotosToModerate();
  }

  componentWillUnmount() {
    console.debug(this.props);
    this.props.stopFetchingPhotosToModerate();
  }

  handleRejectClick = (photo) => {
      console.log(photo);
      this.setState({
        confirmDialogTitle: `Are you sure you want to reject the photo ?`,
        confirmDialogHandleOk: () => this.handleRejectDialogOk(photo.id),
        confirmDialogOpen: true
      });
    };

  handlePhotoClick = (photoSelected) => {
      this.setState({zoomDialogOpen:true, photoSelected});
    };

  handleZoomDialogClose = () => {
    this.setState({zoomDialogOpen:false});
  }

  handleApproveClick = (photo) => {
      console.log(photo);
      this.setState({
        confirmDialogTitle: `Are you sure you want to approve the photo  ?`,
        confirmDialogHandleOk: this.handleApproveDialogOk(photo.id),
        confirmDialogOpen: true
    });
  };

  handleCancelDialog = () => {
    this.setState({confirmDialogOpen: false})
  };

  handleRejectDialogOk = (id) => {
    dbFirebase.rejectPhoto(id,this.props.user.id);
    this.setState({confirmDialogOpen: false});
    this.handleZoomDialogClose();
  };

  handleApproveDialogOk = (id) => () => {
    dbFirebase.approvePhoto(id,this.props.user.id);
    this.setState({confirmDialogOpen: false});
    this.handleZoomDialogClose();
  };

  handleClickButton = () => {
    this.props.goToPage(config.PAGES.map); // go to the map
  };

  render() {
    const { label, photos, handleClose } = this.props;

    return (
      <PageWrapper label={label} handleClose={handleClose} hasHeader={false}>
        <List dense={false}>
          {photos.map(photo => (
            <ListItem key={photo.id} button onClick={() => this.handlePhotoClick(photo)}>
              <Avatar
               imgProps={{ onError: (e) => { e.target.src=placeholderImage} }}
               src={photo.thumbnail} />
              <ListItemText primary={config.PHOTO_ZOOMED_FIELDS.updated(photo.updated)}/>
              <ListItemSecondaryAction>
                <IconButton aria-label='Reject' onClick={() => this.handleRejectClick(photo)}>
                  <ThumbDownIcon />
                </IconButton>
                <IconButton aria-label='Approve' onClick={() => this.handleApproveClick(photo)}>
                  <ThumbUpIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog open={this.state.confirmDialogOpen}>
          <DialogTitle>{this.state.confirmDialogTitle}</DialogTitle>
          <DialogActions>
            <Button onClick={this.state.confirmDialogHandleCancel} color='secondary'>
              Cancel
            </Button>
            <Button onClick={this.state.confirmDialogHandleOk} color='secondary'>
              Ok
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.zoomDialogOpen} onClose={this.handleZoomDialogClose}>
          <DialogContent>
            <div style={{ textAlign: 'center' }}>
              <img onError={(e) => { e.target.src=placeholderImage}} className={'main-image'} alt={this.state.photoSelected.id} src={this.state.photoSelected.main}/>
            </div>
            <CardComponent
              photoSelected={this.state.photoSelected}
              handleRejectClick={this.handleRejectClick}
              handleApproveClick={this.handleApproveClick}
            />
          </DialogContent>

        </Dialog>
      </PageWrapper>
    );
  }
}

const mapStateToProps = state => ({
  photos: state.photos
})

const mapDispatchToProps = dispatch => ({
  startFetchingPhotosToModerate: actions.startFetchingPhotosToModerate(dispatch),
  stopFetchingPhotosToModerate: actions.stopFetchingPhotosToModerate
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModeratorPage);
