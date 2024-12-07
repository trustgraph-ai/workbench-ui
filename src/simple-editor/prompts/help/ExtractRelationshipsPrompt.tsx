
import { Typography, Box } from '@mui/material';

const RelationshipsPromptHelp = ({
}) => {

    return (<>

        <Box sx={{ maxWidth: "45rem" }}>

            <Typography variant="body1" component="p" gutterBottom>
                The purpose of the "Relationships" prompt is to find
                relationshbips between entities, concepts, and values. These
                relationships are structured in triples format as subject,
                predicate, and object. The boolean for entity-object is true
                when the object of a triple is also an entity.   Below are
                tailoring instructions:
            </Typography>

            <Typography variant="body1" component="p" gutterBottom>
                1. The chunked text from the ingested documents can be placed 
                anywhere in the prompt using the variable
                <code>{'{{text}}'}</code>.
            </Typography>

            <Typography variant="body1" component="p" gutterBottom>
                2. The LLM response from this prompt must have the
                following JSON object structure to form correct RDF triples:
            </Typography>

            <pre>
                { '{\n' }
                { '  "subject": string,\n' }
                { '  "predicate": string,\n' }
                { '  "object": string,\n' }
                { '  "entity-object": boolean\n' }
                { '}' }
            </pre>

            <Typography variant="body1" component="p" gutterBottom>
                3. Most LLMs will understand the instruction to return
                an array of the above JSON objects without explicitly
                using array notation in the prompt.
            </Typography>

            <Typography variant="body1" component="p" gutterBottom>
                4. Be precise. Be succinct. Be consistent. In general, 
                less is more with LLM prompts. 
            </Typography>

            <Typography variant="body1" component="p" gutterBottom>
                5. The TrustGraph prompts services can parse code
                delimiters such as ```json``` or simply ``````.
            </Typography>

            <Typography variant="body1" component="p" gutterBottom>
                6. Modify the prompt text below. The modified prompt
                will be packaged in the TrustGraph deployment automatically.
            </Typography>

        </Box>

    </>);
};

export default RelationshipsPromptHelp;

