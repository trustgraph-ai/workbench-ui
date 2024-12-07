import React from 'react';

import {
    FormControl, InputLabel, Select, MenuItem, Box, Stack, Divider,
    Typography,
} from '@mui/material';

interface ModelDeploymentProps {
    value : string;
    onChange: (value: string) => void;
}

const ModelDeployment: React.FC<ModelDeploymentProps> = ({
    value, onChange
}) => {

  return (

        <FormControl fullWidth>

            <InputLabel id="graph-store-label">Model deployment</InputLabel>

            <Select
                labelId="model-deployment-label"
                id="model-deployment-select"
                value={value}
                label="Model deployment"
                onChange={(e) => onChange(e.target.value)}
                sx={{minHeight: 120}}
            >

                <MenuItem value="azure">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            Azure
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >
                            
                            Azure Endpoint Services is a collection of
                            artificial intelligence (AI) services and tools
                            from Microsoft Azure that helps developers and
                            data scientists build, deploy, and manage AI
                            applications.

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="azure-openai">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{ width: 100, textAlign: "center" }}
                            direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            Azure<br/>OpenAI
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >
                            
                            Uses the OpenAI endpoint service which is
                            available on Azure.

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="bedrock">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            Bedrock
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >

                             Amazon Bedrock is a fully managed service that
                             helps customers build generative AI applications.

                             Bedrock was first launched in preview in April
                             2023 and became generally available in September
                             2023. Customers are charged for model inference
                             and customization. There are two pricing plans
                             for inference:

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="claude">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical" flexItem />
                        }
                        alignItems="stretch"
                    >
                        <Stack sx={{width: 100}} direction="column"
                            alignItems="center" justifyContent="center"
                        >
                            Claude
                        </Stack>

                        <Box sx={{
                            width: '36rem'
                        }}>
                            <Typography variant="body2"
                                sx={{ whiteSpace: 'wrap' }}
                            >

                                Anthropic Claude is a family of AI models and
                                chatbots that can perform a variety of tasks.
                                Claude is trained to be helpful, honest, and
                                harmless. It's designed to be trustworthy and
                                reliable, and is resistant to jailbreaks.

                            </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="cohere">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            Cohere
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >

                            Cohere's AI solutions are cloud-agnostic, meaning
                            they can be used regardless of where a company's
                            data is stored. They also offer high levels of
                            security, privacy, and customization with
                            on-premises and private cloud deployment options.

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="googleaistudio">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100, textAlign: "center"}}
                            direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            Google<br/>AI Studio
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >
                            Google AI Studio is an integrated development
                            environment that allows developers to prototype
                            and experiment with generative AI models.
                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="llamafile">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            Llamafile
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >

                            Llamafiles bundle model weights and a
                            specially-compiled version of the Llama.cpp engine
                            into a single file that can run on most computers
                            any additional dependencies. They also come with
                            an embedded inference server that provides an API
                            for interacting with your model.

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="ollama">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            Ollama
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >

                            Ollama is an open-source application that allows
                            users to run large language models (LLMs) locally
                            on their computer or server.  Ollama simplifies
                            the process of running LLMs by bundling model
                            weights, configurations, and data into a single
                            package.
 
                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="openai">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            OpenAI
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >

                            Build and scale AI experiences powered by
                            industry-leading models and tools.

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

                <MenuItem value="vertexai">
                    <Stack
                        direction="row" spacing={2}
                        divider={
                            <Divider orientation="vertical"
                            flexItem
                        />}>
                        <Stack sx={{width: 100}} direction="row"
                            alignItems="center" justifyContent="center"
                        >
                            VertexAI
                        </Stack>
                        <Box sx={{
                            width: '36rem'
                        }}>

                        <Typography variant="body2"
                            sx={{ whiteSpace: 'wrap' }}
                        >

                             Vertex AI is a Google Cloud platform that allows
                             users to train and deploy machine learning (ML)
                             models and AI applications.

                        </Typography>
                        </Box>
                    </Stack>
                </MenuItem>

            </Select>
        </FormControl>

  );
};

export default ModelDeployment;

