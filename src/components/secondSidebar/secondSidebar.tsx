import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Collapse,
  Paper,
} from '@mui/material';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';

export interface MenuItem {
  text: string;
  icon?: React.ReactElement;
  count?: number;
  children?: string[];
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SecondSidebarProps {
  sections: MenuSection[];
  width?: number | string;
  onItemClick?: (itemText: string) => void;
}

// Компонент для вложенных пунктов меню
const CollapsibleMenuItem: React.FC<{
  text: string;
  icon?: React.ReactElement;
  children?: string[];
  onItemClick?: (text: string) => void;
}> = ({ text, icon, children = [], onItemClick }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        fullWidth
        startIcon={icon}
        endIcon={open ? <ArrowDropUp /> : <ArrowDropDown />}
        onClick={() => {
          setOpen(!open);
          onItemClick?.(text);
        }}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          color: '#333',
          py: 1,
          px: 2,
          mb: 0.5,
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
        }}
      >
        {text}
      </Button>
      <Collapse in={open}>
        <Box sx={{ pl: 4, pb: 1 }}>
          {children.map((child, index) => (
            <Typography
              key={index}
              variant="body2"
              onClick={() => onItemClick?.(child)}
              sx={{
                py: 0.5,
                px: 2,
                color: '#666',
                cursor: 'pointer',
                '&:hover': {
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  borderRadius: 1,
                },
              }}
            >
              {child}
            </Typography>
          ))}
        </Box>
      </Collapse>
    </>
  );
};

export const SecondSidebar: React.FC<SecondSidebarProps> = ({ 
  sections, 
  width = 280,
  onItemClick 
}) => {
  return (
    <Paper 
      sx={{ 
        width, 
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #e0e0e0',
        borderRadius: 1,
        p: 2,
        overflow: 'auto',
      }}
    >
      {sections.map((section, sectionIndex) => (
        <Box key={section.title} sx={{ mb: sectionIndex < sections.length - 1 ? 3 : 0 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: '#666',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 1,
              px: 1,
            }}
          >
            {section.title}
          </Typography>
          
          <Box>
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={item.text}>
                {item.children ? (
                  <CollapsibleMenuItem 
                    text={item.text}
                    icon={item.icon}
                    children={item.children}
                    onItemClick={onItemClick}
                  />
                ) : (
                  <Button
                    fullWidth
                    startIcon={item.icon}
                    onClick={() => onItemClick?.(item.text)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      color: '#333',
                      py: 1,
                      px: 2,
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                      {item.text}
                    </Box>
                    {item.count !== undefined && (
                      <Chip
                        label={item.count}
                        size="small"
                        sx={{ 
                          ml: 1,
                          backgroundColor: '#f44336',
                          color: 'white',
                        }}
                      />
                    )}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      ))}
    </Paper>
  );
};