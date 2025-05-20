
import React from 'react';
import { useNavigate } from "react-router";

import { Box, Avatar, HStack, Tag} from '@chakra-ui/react';

import { Entity } from '../../state/Entity';
import { useWorkbenchStateStore } from '../../state/WorkbenchState';

interface EntityListProps {
}

const EntityList : React.FC <EntityListProps> = ({
}) => {

    const entities = useWorkbenchStateStore((state) => state.entities);
    const selected = useWorkbenchStateStore((state) => state.selected);
    const setSelected = useWorkbenchStateStore((state) => state.setSelected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    const navigate = useNavigate();

    const onSelect = (x : Entity) => {
        setSelected(x);
        navigate("/entity");
    };

    return (
        <HStack mt={8}>
          { entities.slice(0, 8).map((entity, ix) => (
              <Tag.Root asChild size="sm" key={ix}
                color="brand.solid" bgColor="bg"
                variant="surface"
              >
                <button onClick={ () => onSelect(entity) }>
                  <Tag.Label>{entity.label}</Tag.Label>
                </button>
              </Tag.Root>
            ))
          }
        </HStack>
    );

}

export default EntityList

