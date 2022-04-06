import React, { useEffect, useState } from 'react';
import { Button, Grid, Alert, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LayoutPicker from '../_layout/LayoutSelect';
import { convertToRaw, EditorState } from 'draft-js';
import draftToText from '../../utils/draftToText';
import SuccessDialog from '../_layout/SuccessDialog';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import WordCard from './layout/WordCard';
import Copyright from '../_layout/Copyright';
import { setBaseState } from '../../reducers/userReducer';
import {
    useUpdateWordSearchMutation,
    useGetWordSearchBySlugQuery
} from '../../services/games';
import { wordObj } from '../../types';
import textToDraft from '../../utils/textToDraft';

const EditWordSearch = () => {
    const { slug } = useParams();
    const initialState: wordObj[] = [
        {
            word: '',
            tip: EditorState.createEmpty()
        },
        {
            word: '',
            tip: EditorState.createEmpty()
        },
        {
            word: '',
            tip: EditorState.createEmpty()
        }
    ];
    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState('');
    const [words, setWords] = useState(initialState);
    const [name, setName] = useState('');
    const [layout, setLayout] = useState(1);
    const { data, error, isLoading } = useGetWordSearchBySlugQuery(
        slug as string
    );
    const [updateWordSearch, response] = useUpdateWordSearchMutation();
    const dispatch = useDispatch();
    const handleAddWord = () => {
        if (words.length >= 8) {
            setAlert('O numero máximo de palavras nesse jogo é 8!');
            return;
        }
        let p = [...words];
        p.push({
            word: '',
            tip: EditorState.createEmpty()
        });
        setWords(p);
    };
    const handleRemoveWord = (index: number) => {
        if (words.length === 1) {
            return;
        }
        let p = [...words];
        p.splice(index, 1);
        setWords(p);
    };
    const handleWordChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        let p = [...words];
        let word = p[index];
        word.word = event.target.value;
        p.splice(index, 1, word);
        setWords(p);
    };
    const handleTipChange = (editorState: EditorState, index: number) => {
        let p = [...words];
        let word = p[index];
        word.tip = editorState;
        p.splice(index, 1, word);
        setWords(p);
    };
    const handleLayout = (
        event: React.ChangeEvent<HTMLInputElement>,
        newLayout: number
    ) => {
        if (newLayout === null) {
            return;
        }
        setLayout(newLayout);
    };
    const handleSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (words.length < 3) {
            setAlert('O jogo deve ter no mínimo 3 palavras!');
            return;
        }
        let wordsJSON: wordObj[] = [];
        let error = false;
        words.map((word: wordObj) => {
            const tip = word.tip as EditorState;
            let content = tip.getCurrentContent();
            if (content.getPlainText('').length === 0) {
                setAlert('Preencha todos os campos!');
                error = true;
                return;
            }
            let textJson = convertToRaw(content);
            let markup = draftToText(textJson);
            wordsJSON.push({
                tip: markup,
                word: word.word
            });
        });
        if (error) {
            return;
        }
        let body = {
            name: name,
            layout: layout,
            words: wordsJSON
        };
        updateWordSearch({ slug, ...body });
    };

    const formatTips = (raw: wordObj[]): wordObj[] => {
        raw.map((word: wordObj) => {
            if (typeof word.tip !== 'string') {
                return;
            }
            word.tip = textToDraft(word.tip);
        });
        return raw;
    };

    useEffect(() => {
        setTimeout(() => {
            if (localStorage.getItem('token') === null) {
                window.location.href = '/401';
            }
            dispatch(setBaseState());
        }, 2000);
    }, []);

    useEffect(() => {
        if (data) {
            data.approved_at &&
                setAlert(
                    'Esse jogo já foi aprovado, logo não pode mais ser editado!'
                );
            let deep_copy = JSON.parse(JSON.stringify(data.words));
            setWords(formatTips(deep_copy));
            setName(data.name);
            setLayout(data.layout);
        }
        error && setAlert(`Ocorreu um erro ${error}`);
    }, [isLoading]);

    useEffect(() => {
        response.isSuccess && setOpen(true);
        response.isError && setAlert(`Ocorreu um erro ${response.error} `);
    }, [response.isLoading]);

    return (
        <>
            <SuccessDialog
                open={open}
                handleClose={() => {
                    setOpen(false);
                }}
            />
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
                    <LayoutPicker
                        handleLayout={handleLayout}
                        selectedLayout={layout}
                    />
                    {/* @ts-ignore*/}
                    <Grid item align="center" xs={12}>
                        <Button
                            onClick={handleAddWord}
                            endIcon={<AddIcon fontSize="small" />}
                            variant="contained"
                        >
                            Adicionar Palavra
                        </Button>
                    </Grid>
                    {/* @ts-ignore*/}
                    <Grid item align="center" lg={12}>
                        <Grid
                            container
                            alignItems="flex-start"
                            justifyContent="center"
                            spacing={3}
                        >
                            {alert && (
                                /* @ts-ignore*/
                                <Grid item align="center" xs={12}>
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
                            {words.map((item: wordObj, index: number) => {
                                return (
                                    <WordCard
                                        item={item}
                                        key={index}
                                        index={index}
                                        handleWordChange={handleWordChange}
                                        handleRemoveWord={handleRemoveWord}
                                        handleTipChange={handleTipChange}
                                    />
                                );
                            })}
                        </Grid>
                    </Grid>
                    {/* @ts-ignore*/}
                    <Grid item align="center" xs={12}>
                        <Button
                            size="large"
                            type="submit"
                            variant="outlined"
                            disabled={!!data?.approved_at}
                        >
                            Salvar
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Copyright />
        </>
    );
};

export default EditWordSearch;
