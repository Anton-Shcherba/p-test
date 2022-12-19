import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@mui/material/Button';
import {
  Box,
  Typography,
  Link,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  TextField,
  Pagination,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { Product } from '../../server/src/parser/types';
import Image from 'mui-image';
import styled from '@emotion/styled';

const StyledBox = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 16,
});

function App() {
  const [data, setData] = useState<Product[]>([]);
  const [inputBrands, setBrands] = useState<string[]>([]);
  const [inputSizes, setSizes] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);

  const filtering = data
    .filter((p) => !inputBrands.length || inputBrands.includes(p.brand))
    .filter((p) => !inputSizes.length || inputSizes.includes(p.size));

  const slicing = filtering.slice((page - 1) * 20, page * 20);

  const brands = Array.from(
    new Set(
      data
        .map((p) => p.brand)
        .filter(Boolean)
        .sort()
    )
  );

  const sizes = Array.from(
    new Set(
      data
        .map((p) => p.size)
        .filter(Boolean)
        .sort()
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:3000/');
      const result = await response.json();
      setData(result);
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
        gap: 2,
        backgroundColor: '#f2f6fa',
        boxSizing: 'border-box',
        minHeight: '100vh',
      }}
    >
      <Backdrop sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={data.length === 0}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Autocomplete
          onChange={(_, newValue) => {
            setBrands(newValue);
            setPage(1);
          }}
          multiple
          options={brands}
          getOptionLabel={(option) => option.toUpperCase()}
          filterSelectedOptions
          renderInput={(params) => <TextField {...params} label="Brands" />}
        />
        <Autocomplete
          onChange={(_, newValue) => {
            setSizes(newValue);
            setPage(1);
          }}
          multiple
          options={sizes}
          getOptionLabel={(option) => option.toUpperCase()}
          filterSelectedOptions
          renderInput={(params) => <TextField {...params} label="Sizes" />}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
          {slicing.map((prod) => (
            <Link
              key={prod.link}
              href={prod.link}
              underline="none"
              sx={{ display: 'flex', borderRadius: 1, p: 1, backgroundColor: 'white' }}
            >
              <Image
                showLoading
                errorIcon
                height={100}
                width={100}
                duration={300}
                style={{ borderRadius: 4 }}
                fit="cover"
                src={prod.imgLink}
              />
              <Box
                sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ml: 1, width: 180 }}
              >
                <Box sx={{ textAlign: 'center', mt: -0.5 }}>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.45 }}>
                    {`${prod.isPants ? 'подгузники-трусики' : 'подгузники'}`}
                  </Typography>
                  <Typography noWrap sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                    {`${prod.size || ''} ${prod.brand || ''}`.toUpperCase()}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1 }}>
                    {prod.series}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', px: 0.5 }}>
                  <Typography noWrap sx={{ fontWeight: 'bold', lineHeight: 1.35 }}>{`${prod.price} руб`}</Typography>
                  <Box sx={{ display: 'flex', mx: 'auto', maxWidth: 'min-content', lineHeight: 1.4 }}>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{
                        px: 0.5,
                        lineHeight: 1.35,
                      }}
                    >{`${prod.count}шт ×`}</Typography>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{
                        backgroundColor: 'red',
                        borderRadius: 1,
                        color: 'white',
                        px: 0.5,
                        lineHeight: 1.35,
                      }}
                    >{`${prod.priceForOne}р`}</Typography>
                  </Box>
                </Box>
              </Box>
            </Link>
          ))}
        </Box>
      </Box>
      <Pagination
        hidePrevButton
        hideNextButton
        sx={{ mx: 'auto' }}
        count={Math.ceil(filtering.length / 20)}
        page={page}
        onChange={(_, value) => {
          setPage(value);
          window.scrollTo(0, 0);
        }}
      />
    </Box>
  );
}

export default App;
