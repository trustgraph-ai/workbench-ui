
import {
    Box, TextField,
} from '@mui/material';

interface PromptProps {
    value : string;
    onChange : (value : string) => void;
}

const Prompt : React.FC<PromptProps> = ({value, onChange}) => {

    return (
        <>

            <Box sx={{ mt: 4, minWidth: '45rem'}}>
                <TextField fullWidth
                    label="Prompt"
                    multiline
                    rows={25}
                    value={value}
                    onChange={
                        (event: React.ChangeEvent<HTMLInputElement>) => {
                            onChange(event.target.value);
                        }
                    }
                />
            </Box>

        </>
    );
}

export default Prompt;

