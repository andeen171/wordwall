import React, { ChangeEvent, useEffect, useState } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { Grid, Button, CircularProgress, Alert } from '@mui/material';
import ImageEditor from './layout/ImageEditor';
import LayoutSelect from '../_layout/LayoutSelect';
import SuccessDialog from '../_layout/SuccessDialog';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import GridSelect from './layout/GridSelect';
import Copyright from '../_layout/Copyright';
import { Box } from '@mui/system';

const EditMemoryGame = () => {
    const { slug } = useParams();
    const open = useSelector((state) => state.base.open);
    const alert = useSelector((state) => state.base.alert);
    const memorygame = useSelector((state) => state.game.memorygame);
    const progress = useSelector((state) => state.base.progress);
    const [defaultImages, setDefaultImages] = useState(memorygame.images);
    const [images, setImages] = useState(memorygame.images);
    const [size, setSize] = useState(
        (memorygame.grid[0] * memorygame.grid[1]) / 2
    );
    const [layout, setLayout] = useState(memorygame.layout);
    const dispatch = useDispatch();
    const { getGame, editGame, setAlert, setClose, refreshBaseState } =
        bindActionCreators(actionCreators, dispatch);
    const handleSize = (
        event: ChangeEvent<HTMLInputElement>,
        newSize: number
    ) => {
        if (newSize === null) {
            return;
        }
        setSize(newSize);
        if (newSize < images.length) {
            images.splice(newSize - 1, images.length - newSize);
        } else if (newSize > images.length) {
            let img = [...images];
            for (let i = 0; i < newSize - images.length; i++) {
                img.push(null);
            }
            setImages(img);
        }
    };
    const handleLayout = (
        event: ChangeEvent<HTMLInputElement>,
        newLayout: number
    ) => {
        if (newLayout === null) {
            return;
        }
        setLayout(newLayout);
    };
    const updateImage = (newImage: Blob, index: number) => {
        let i = [...images];
        i.splice(index, 1, newImage);
        setImages(i);
    };
    const handleSubmit = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (images.includes(null)) {
            setAlert('Preencha todos os campos!');
            return;
        }
        const data = new FormData();
        images.map((image: Blob) => {
            data.append('images[]', image);
        });
        data.append('layout', layout.toString());
        editGame(data, 'memorygame', memorygame.slug, 'multipart/form-data');
    };
    useEffect(() => {
        getGame('memorygame', slug as string);
        setTimeout(() => {
            if (localStorage.getItem('token') === null) {
                window.location.href = '/401';
            }
            refreshBaseState();
        }, 2000);
    }, []);

    useEffect(() => {
        memorygame.approved_at &&
            setAlert(
                'Esse jogo já foi aprovado, logo não pode mais ser editado!'
            );
        setDefaultImages(memorygame.images);
        setImages(memorygame.images);
        setSize((memorygame.grid[0] * memorygame.grid[1]) / 2);
        setLayout(memorygame.layout);
    }, [memorygame.slug]);

    return (
        <>
            <SuccessDialog open={open} handleClose={setClose} />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row'
                }}
            >
                <Grid
                    container
                    component="form"
                    justifyContent="center"
                    onSubmit={handleSubmit as any}
                    spacing={3}
                >
                    <LayoutSelect
                        handleLayout={handleLayout}
                        selectedLayout={layout}
                    />
                    <GridSelect size={size} handleSize={handleSize} />
                    <Grid item xs={12}>
                        <Grid
                            container
                            alignItems="flex-start"
                            justifyContent="center"
                            spacing={3}
                        >
                            {alert && (
                                <Grid item xs={12}>
                                    <Alert
                                        severity="warning"
                                        onClick={() => {
                                            setAlert('');
                                        }}
                                    >
                                        {alert}
                                    </Alert>
                                </Grid>
                            )}
                            {images.map((image: Blob, index: number) => {
                                return (
                                    <ImageEditor
                                        key={index}
                                        index={index}
                                        defaultImg={defaultImages[index]}
                                        callback={updateImage}
                                    />
                                );
                            })}
                        </Grid>
                    </Grid>
                    {progress === 0 ? (
                        <Grid item xs={12}>
                            <Button
                                size="large"
                                type="submit"
                                variant="outlined"
                                disabled={!!memorygame.approved_at}
                            >
                                Salvar
                            </Button>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <CircularProgress
                                variant="determinate"
                                value={progress}
                            />
                        </Grid>
                    )}
                </Grid>
            </Box>
            <Copyright />
        </>
    );
};

export default EditMemoryGame;
