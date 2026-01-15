import React from "react";
import {
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip
} from "@mui/material";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import StarIcon from "@mui/icons-material/Star";

export type Participant = {
  id: string;
  name: string;
  hasVoted: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  card: string | null;
};

type ParticipantListProps = {
  users: Participant[];
  currentUserId: string;
  canKick: boolean;
  reveal: boolean;
  onKick: (userId: string) => void;
};

const ParticipantList = ({ users, currentUserId, canKick, reveal, onKick }: ParticipantListProps) => (
  <List dense sx={{ width: "100%" }}>
    {users.map((user) => (
      <ListItem
        key={user.id}
        secondaryAction={
          canKick && user.id !== currentUserId && !user.isAdmin ? (
            <Tooltip title="Kick">
              <IconButton edge="end" onClick={() => onKick(user.id)}>
                <PersonOffIcon />
              </IconButton>
            </Tooltip>
          ) : null
        }
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: user.isOnline ? "primary.main" : "grey.400" }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} alignItems="center">
              {user.name}
              {user.isAdmin && <StarIcon fontSize="small" color="warning" />}
            </Stack>
          }
          secondary={user.isOnline ? "Online" : "Offline"}
          primaryTypographyProps={{ fontSize: "1.05rem", fontWeight: 600 }}
          secondaryTypographyProps={{ fontSize: "0.95rem" }}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          {user.hasVoted && <Chip label="Voted" color="success" sx={{ fontSize: "0.95rem" }} />}
          {reveal && user.card && <Chip label={user.card} color="primary" sx={{ fontSize: "0.95rem" }} />}
        </Stack>
      </ListItem>
    ))}
  </List>
);

export default ParticipantList;
