import Head from 'next/head';
import React,{Component} from 'react';
import Layout from '../components/layout';
import Button from '@material-ui/core/Button';
import Styles from './gallery.module.css';
import Spinner from '../components/spinner';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Link from 'next/link';
import { withRouter } from 'next/router'

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import Toolbar from '@material-ui/core/Toolbar';
import clsx from 'clsx';
import { Typography } from '@material-ui/core';
import {getAllPitches, uploadFile, deletePitch} from '../utils/apis';

class Gallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      uploadStatus: -1,
      loading: true,
      downloadUrl: "",
      pitches: [],
      lastClickTs: 0,
      openDelete: false,
    }
  }

  onFileChange = event => {
    // Update the state
    const file = event.target.files[0];
    uploadFile(file);
  };

  componentDidMount() {
    getAllPitches().then(resp => {
      console.log('getAllPitches', resp);
      this.setState({
        pitches: resp.data.payload.items,
        loading: false,
      })
    }).catch(error => {

    })
  }

  onSelectFile = (e, f) => {
    const {selectedFile, lastClickTs} = this.state;
    e.preventDefault();
    e.stopPropagation();
    const nowTs = Date.now();
    if (selectedFile && selectedFile.id === f.id) {
      if (nowTs - lastClickTs < 500) {
        const {router} = this.props;
        router.push(`/invest?pitchId=${f.id}`);
      } else {
        this.setState({
          lastClickTs: nowTs,
        });
      }
    } else {
      this.setState({
        selectedFile: f,
        lastClickTs: nowTs,
      });
    }
  }

  deselect = () => {
    this.setState({
      selectedFile: null
    })
  }

  onDeleteFile = () => {
    const {selectedFile, pitches} = this.state;
    this.setState({
      openDelete: false,
    })
    deletePitch(selectedFile.id).then(resp => {
      const newPitches = [...pitches];
      for(let i = 0; i < pitches.length; i++) {
        if (pitches[i].id === selectedFile.id) {
          newPitches.splice(i, 1);
          break;
        }
      }
      this.setState({
        pitches: newPitches,
      })
    }).catch(error => {
    })
  }

  closeDelete = () => {
    this.setState({openDelete: false});
  }

  render() {
    const {loading, pitches, selectedFile, openDelete} = this.state;
    return (
      <Layout>
        <Head>
          <title>Gallery</title>
        </Head>
        <main>
          <Toolbar>
            <Box ml={2} mr={2}>
              <Button
                variant="outlined"
                color="primary"
                component="label"
                m={10}
              >
                UPLOAD
                <input
                  type="file"
                  accept=".pdf,.pptx,application/pdf,application/vnd.ms-powerpoint"
                  hidden
                  onChange={this.onFileChange}
                />
              </Button>
            </Box>
            {
              selectedFile && 
              <div className={Styles.iconBar}>
                <IconButton onClick={() => this.setState({openDelete: true})}>
                  <DeleteIcon />
                </IconButton>
                <Link href={selectedFile.download_url}>
                  <a>
                    <IconButton>
                      <CloudDownloadIcon />
                    </IconButton>
                  </a>
                </Link>
                <Link href={`/invest?pitchId=${selectedFile.id}`}>
                  <a>
                    <IconButton>
                      <VisibilityIcon />
                    </IconButton>
                  </a>
                </Link>
              </div>
            }
          </Toolbar>
          {
            loading ?
            <Spinner />
            :
            <div className={Styles.gridContainer} onClick={this.deselect}>
              {
                pitches.map(pitch => (
                  <div
                    key={pitch.id}
                    className={Styles.gridPile} 
                    onClick={(e) => this.onSelectFile(e, pitch)}
                  >
                    <img src={pitch.thumb_url} />
                    <div className={clsx({
                        [Styles.gridInfo]: true,
                        [Styles.gridSelected]: selectedFile && selectedFile.id === pitch.id,
                      })}
                    >
                      <Typography variant="body1" align="center">
                        {pitch.filename}
                      </Typography>
                    </div>
                  </div>
                ))
              }
            </div>
          }
          <Dialog
            open={openDelete}
            onClose={this.closeDelete}
          >
            <DialogTitle>{"Are you sure you want to delete this file?"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                This action canot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeDelete} color="primary" autoFocus>
                Cancel
              </Button>
              <Button onClick={this.onDeleteFile} color="secondary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </main>
      </Layout>
    )
  }
}

export default withRouter(Gallery);