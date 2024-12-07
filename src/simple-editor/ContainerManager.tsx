import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface ContainerManagerProps {
  value: string;
  onChange: (value: string) => void;
}

const ContainerManager: React.FC<ContainerManagerProps> = ({ value, onChange }) => {
  return (
    <FormControl fullWidth>
      <InputLabel>Container Manager</InputLabel>
      <Select
        value={value}
        label="Container Manager"
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="docker">Docker</MenuItem>
        <MenuItem value="podman">Podman</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ContainerManager;