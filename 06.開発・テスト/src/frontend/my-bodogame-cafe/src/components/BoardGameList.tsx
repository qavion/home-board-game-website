import React from 'react';
import { Box, Typography, Grid2, Card, CardContent, CardMedia } from '@mui/material';

// ダミーのボードゲームデータ（後でAPIから取得するように変更）
const dummyBoardGames = [
    {
        id: 1,
        title: 'インサイダーゲーム',
        description: 'あなたは、操られている。クイズと正体探し、ふたつの楽しさが絶妙にマッチした、短時間でみんなが盛り上がれる会話型ゲーム。',
        imageUrl: 'images/01_insider_01-top.jpg', // 画像へのパスを適切に設定してください
    },
    {
        id: 2,
        title: 'カタン',
        description: '資源を集めて開拓し、勝利点を競う戦略ゲーム',
        imageUrl: 'images/02_katan_01-top.jpg', // 画像へのパスを適切に設定してください
    },
    {
        id: 3,
        title: 'カタン',
        description: 'a a a a a a a a a a a a a',
        imageUrl: 'images/02_katan_01-top.jpg', // 画像へのパスを適切に設定してください
    },
    {
        id: 4,
        title: 'カタン',
        description: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a',
        imageUrl: 'images/02_katan_01-top.jpg', // 画像へのパスを適切に設定してください
    },
    {
        id: 5,
        title: 'カタン',
        description: 'a a a a a a a a a a a a a a a a a a a a a a a ',
        imageUrl: 'images/02_katan_01-top.jpg', // 画像へのパスを適切に設定してください
    },
    {
        id: 6,
        title: 'カタン',
        description: 'a a a a a a a a a a a a a a a a a a a a a a a ',
        imageUrl: 'images/02_katan_01-top.jpg', // 画像へのパスを適切に設定してください
    },
    {
        id: 7,
        title: 'カタン',
        description: 'a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a a ',
        imageUrl: 'images/02_katan_01-top.jpg', // 画像へのパスを適切に設定してください
    },
    // 必要に応じてさらにゲームデータを追加
];

const BoardGameList: React.FC = () => {
    const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            {/* <Typography variant="h4" gutterBottom>
                ボードゲーム一覧
            </Typography> */}
            <Grid2 container spacing={2}>
                {dummyBoardGames.map((game) => (
                    <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2}} key={game.id}>
                        <Card>
                            <Box sx={{ position: 'relative', paddingTop: '100%'}}>
                                <CardMedia
                                    component="img"
                                    alt={game.title}
                                    height="140"
                                    image={`${cloudfrontDomain}/${game.imageUrl}`}
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover', // 画像全体を表示し、縦横比を維持
                                    }}
                                />
                            </Box>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {game.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {game.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid2>
                ))}
            </Grid2>
        </Box>
    );
};

export default BoardGameList;