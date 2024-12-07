import React from 'react';
import {
    FormControl, InputLabel, Select, MenuItem, TextField, Slider
} from '@mui/material';

import modelsRaw from './models.json';
const models = modelsRaw as { [ix : string ] : string[] };

interface ModelParametersProps {
    modelName: string;
    temperature: number;
    maxOutputTokens: number;
    onModelNameChange: (value: string) => void;
    onTemperatureChange: (value: number) => void;
    onMaxOutputTokensChange: (value: number) => void;
    modelDeployment : string;
}

const ModelParameters: React.FC<ModelParametersProps> = ({
    modelName,
    temperature,
    modelDeployment,
    maxOutputTokens,
    onModelNameChange,
    onTemperatureChange,
    onMaxOutputTokensChange,
}) => {

    const availModels = models[modelDeployment];

    const ModelList : React.FC<{
        modelName : string;
        availModels : string[];
        onModelNameChange : (value: string) => void;
    }> = ({ modelName, availModels, onModelNameChange}) => {

        const readOnly = (availModels.length == 0);

        if (availModels.length == 0) {
            return (
                <FormControl fullWidth disabled>

                    <InputLabel id="model-name-label">Model</InputLabel>

                    <Select
                        labelId="model-name-label"
                        id="model-name-select"
                        value="n/a"
                        label="Model"
                    >
                        <MenuItem key="n/a" value="n/a">n/a</MenuItem>
                    </Select>
                </FormControl>
            );

        }

        return (
            <FormControl fullWidth>

                <InputLabel id="model-name-label">Model</InputLabel>

                <Select
                    labelId="model-name-label"
                    id="model-name-select"
                    value={modelName}
                    label="Model"
                    onChange={(e) => onModelNameChange(e.target.value)}
                    inputProps={{ readOnly: readOnly }}
                >
                    {
                        availModels.map(
                            (v) => (
                                <MenuItem key={v}
                                    value={v}>
                                    {v}
                                </MenuItem>
                            ))
                    }
                </Select>

            </FormControl>

        );
    }

    return (
        <div>

            <ModelList modelName={modelName} availModels={availModels}
                onModelNameChange={onModelNameChange}
            />

            <div>
                <p>Temperature: {temperature}</p>
                <Slider
                    value={temperature}
                    onChange={
                        (_, value) => onTemperatureChange(value as number)
                    }
                    min={0}
                    max={2}
                    step={0.01}
                />
            </div>
            <TextField
                fullWidth
                label="Max output tokens"
                type="number"
                value={maxOutputTokens}
                onChange={
                    (e) => onMaxOutputTokensChange(parseInt(e.target.value))
                }
                margin="normal"
            />
        </div>
    );
};

export default ModelParameters;

