
import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
    List, ListItem, ListItemText, Avatar, Card, CardContent,
    Typography, Box, Button, Stack, TextField
} from '@mui/material';

import {
    Send, SmartToy, Person
} from '@mui/icons-material';

import { useSocket } from './socket/socket';

import ChatConversation from './ChatConversation';

interface ChatProps {
}

const Chat : React.FC <ChatProps> = ({
}) => {

    return (
        <>
            <ChatConversation/>
        </>

    );

}

export default Chat;

