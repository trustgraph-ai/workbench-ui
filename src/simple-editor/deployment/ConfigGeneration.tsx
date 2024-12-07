
import React, { useState } from 'react';

import { Plumbing } from '@mui/icons-material';

import {
    Button, Typography, Paper, CircularProgress, Snackbar, IconButton,
    SnackbarCloseReason, Box, Stack,
} from '@mui/material';
import { Close } from '@mui/icons-material';

import { generateConfig } from '../generate-config';
import { useModelParamsStore } from '../state/ModelParams';
import { usePromptsStore } from '../state/Prompts';
import { useAgentsStore } from '../state/Agents';
import { useDeploymentStore } from '../state/Deployment';
import { useOptionsStore } from '../state/Options';

const Generating = () => {
    return (
        <CircularProgress sx={{mt: 2}}/>
    );
};

const ConfigGeneration = () => {

    const modelParams
        = useModelParamsStore((state) => state);

    const prompts = usePromptsStore((state) => state);

    const agents = useAgentsStore((state) => state);

    const options
        = useOptionsStore((state) => state);

    const setConfigUrl
        = useDeploymentStore((state) => state.setConfigUrl);

    const [errorMessage, setErrorMessage] = useState("");
    const [generating, setGenerating] = useState(false);
    const [open, setOpen] = React.useState(false);

    const generate = () => {

        setGenerating(true);

        generateConfig(
            modelParams, prompts, agents, options,
        ).then(
            response => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw response.statusText;
                }
            }
        ).then(
            blob => {
                setGenerating(false);
                if (blob) {
                    var url = window.URL.createObjectURL(blob);
                    setConfigUrl(url);
                }
            }
        ).catch(
            err => {
                console.log(err);
                setGenerating(false);
                setOpen(true);
                setConfigUrl("");
                setErrorMessage(
                    `Configuration generation failed: ${err}`
                );
            }
        );

    }

    const handleClose = (
        _event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const action = (
      <React.Fragment>
          <Button color="primary" size="small" onClick={handleClose}>
            CLOSE
          </Button>
          <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
          >
              <Close fontSize="small" />
          </IconButton>
      </React.Fragment>
    );

    return (
        <>

            <Box>
                <Paper sx={{ minWidth: 375, mt: 2, p: 2 }} elevation={3}>
                    <Stack
                        direction="row" spacing={2}
                        alignItems="center"
                    >
                        <Plumbing color="primary" fontSize="large"/>
                        <Typography variant="h6" component="h3">
                            <Box>Generate Your Deployment</Box>
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{mt: 2}}>
                        When you have selected the configuration options
                        and customizations for your use case, click below
                        to generate the configuration package. Once generated,
                        the package can be downloaded as a ZIP file.
                    </Typography>
                    { generating ? <Generating/> : '' }
                    <Box sx={{mt: 1}}>
                        <Button onClick={() => generate()}>Generate 🚀</Button>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={errorMessage}
                action={action}
            />

        </>
    );
}

export default ConfigGeneration;

