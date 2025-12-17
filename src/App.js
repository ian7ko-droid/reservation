// src/App.js
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  where,
  updateDoc,
  doc,
  getDoc,
  query,
  deleteDoc,
} from "firebase/firestore";
import axios from "axios";

// Material UI
import {
  TextField,
  Button,
  Container,
  Paper,
  Box,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import ReactMarkdown from "react-markdown";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleUp = keyframes`
  from {
    transform: scale(0.9);
  }
  to {
    transform: scale(1);
  }
`;

function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("");
  // 當前日期（yyyy-mm-dd）
  const todayStr = new Date().toISOString().split("T")[0];

  const [queryPhone, setQueryPhone] = useState("");
  const [reservation, setReservation] = useState(null);

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);

  const [elevated, setElevated] = useState(false);

  const [chatResponse, setChatResponse] = useState("");
  const [userMessage, setUserMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "reservations"), {
        name,
        phone,
        date,
        time,
        people,
        createdAt: new Date(),
      });

      setOpenSnackbar(true);

      setName("");
      setPhone("");
      setDate("");
      setTime("");
      setPeople("");
    } catch (error) {
      console.error("Error:", error);
      alert("訂位失敗，請查看 Console");
    }
  };

  // 修正查詢功能，確保每次查詢正確執行
  const handleQuery = async (e) => {
    e.preventDefault();

    // 清空之前的查詢結果
    setReservation(null);

    try {
      // 查詢條件：根據電話號碼查詢
      const querySnapshot = await getDocs(
        query(collection(db, "reservations"), where("phone", "==", queryPhone))
      );

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setReservation({ id: querySnapshot.docs[0].id, ...data });
      } else {
        alert("找不到對應的訂位資訊");
      }
    } catch (error) {
      console.error("查詢失敗：", error);
      alert("查詢失敗，請稍後再試");
    }

    // 清空查詢表單
    setQueryPhone("");
  };

  // 更新修改功能，確保 Firebase 同步並重新查詢最新數據
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (reservation) {
        await updateDoc(doc(db, "reservations", reservation.id), {
          name: reservation.name,
          phone: reservation.phone,
          date: reservation.date,
          time: reservation.time,
          people: reservation.people,
        });
        // 直接 setReservation，確保畫面狀態與表單同步
        setReservation(null);
        alert("訂位資訊已更新");
      }
    } catch (error) {
      console.error("更新失敗：", error);
      alert("更新失敗，請稍後再試");
    }
  };

  // 添加取消功能，刪除 Firebase 中的資料
  const handleCancel = async () => {
    try {
      if (reservation) {
        // 刪除 Firebase 中的對應記錄
        await deleteDoc(doc(db, "reservations", reservation.id));

        // 清空查詢結果
        setReservation(null);
        alert("訂位已取消");
      }
    } catch (error) {
      console.error("取消失敗：", error);
      alert("取消失敗，請稍後再試");
    }
  };

  // 添加餐廳資訊展示區塊
  const restaurantInfo = {
    name: "高檔餐廳",
    description: "本餐廳主打頂級牛排與新鮮海鮮，提供舒適優雅的用餐環境，適合家庭聚餐、商務宴請及浪漫約會。",
    hours: "週一至週日 11:00 - 22:00",
    address: "台北市信義區XX路XX號",
    phone: "02-1234-5678",
    transport: "捷運信義安和站步行5分鐘，公車信義路口站下車即達。",
    parking: "本餐廳備有地下停車場，亦可於鄰近停車場停車。",
    website: "https://luxury-restaurant.example.com",
    payment: "現金、信用卡、行動支付皆可。",
    service: "免費Wi-Fi、包廂、兒童座椅、素食選項、生日蛋糕預訂。",
    menu: [
      { name: "招牌牛排", price: "$1200" },
      { name: "海鮮義大利麵", price: "$800" },
      { name: "經典沙拉", price: "$300" },
      { name: "松露薯條", price: "$220" },
      { name: "手工甜點", price: "$180" },
      { name: "主廚濃湯", price: "$150" },
      { name: "香煎鴨胸", price: "$950" },
      { name: "炙燒干貝", price: "$680" },
      { name: "義式烤雞腿", price: "$520" },
      { name: "蒜香奶油蝦", price: "$480" },
      { name: "田園蔬菜烘蛋", price: "$350" },
      { name: "法式洋蔥湯", price: "$180" },
      { name: "經典提拉米蘇", price: "$160" },
      { name: "現打果汁", price: "$120" },
      { name: "精品咖啡", price: "$100" },
    ],
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const handleScroll = () => {
      setElevated(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 發送訊息給聊天機器人
  const sendMessage = async () => {
    if (!userMessage.trim()) return;
    setChatResponse("處理中...");
    try {
      const response = await axios.post("/api/chat", { message: userMessage });
      if (response.data && (response.data.reply || response.data.message || response.data.result)) {
        setChatResponse(response.data.reply || response.data.message || response.data.result);
      } else {
        setChatResponse("無法獲取聊天機器人回應");
      }
    } catch (error) {
      console.error("Error calling chat API:", error);
      setChatResponse("無法連接到聊天服務，請稍後再試");
    }
    setUserMessage("");
  };

  return (
    <>
      {/* 修改 AppBar，添加透明效果和滾動時的樣式變化 */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: elevated ? "rgba(168, 182, 202, 0.85)" : "rgba(63, 81, 181, 0.3)",
          transition: "background-color 0.3s ease",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            線上訂位系統
          </Typography>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab label="訂位系統" />
            <Tab label="餐廳資訊" />
            {/* Removed admin page tab */}
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* 根據選擇的 Tab 顯示內容 */}
      {tabIndex === 0 && (
        <Box
          sx={{
            backgroundImage:
              "url('https://unsplash.com/photos/zlABb6Gke24/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mjh8fHJlc3RhdXJhbnR8ZW58MHx8fHwxNzY1MzI5ODAzfDA&force=true')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.8)", // 半透明背景
              maxWidth: "500px",
              width: "100%",
              animation: `${scaleUp} 0.3s ease-in-out`,
            }}
          >
            <Box sx={{ padding: 3 }}>
              <Typography variant="h4" align="center" gutterBottom>
                馬上預約座位
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  label="姓名"
                  fullWidth
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <TextField
                  label="電話"
                  fullWidth
                  margin="normal"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <TextField
                  label="日期"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  inputProps={{ min: todayStr }}
                />

                <TextField
                  label="時間"
                  type="time"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  inputProps={{ step: 60, min: "00:00", max: "23:59" }}
                />

                <TextField
                  label="人數"
                  type="number"
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 1 }}
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{
                    marginTop: 2,
                    animation: `${fadeIn} 0.5s ease-in-out`,
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  立即訂位
                </Button>
              </Box>

              <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
              >
                <Alert severity="success" variant="filled">
                  訂位成功！
                </Alert>
              </Snackbar>

              {/* 查詢表單 */}
              <Box component="form" onSubmit={handleQuery} sx={{ marginTop: 4 }}>
                <TextField
                  label="查詢電話"
                  fullWidth
                  margin="normal"
                  value={queryPhone}
                  onChange={(e) => setQueryPhone(e.target.value)}
                  required
                />
                <Button type="submit" variant="contained" color="primary">
                  查詢訂位
                </Button>
              </Box>

              {/* 查詢結果 */}
              {reservation && (
                <Paper elevation={3} sx={{ padding: 2, marginTop: 4 }}>
                  <Typography variant="h6">訂位資訊</Typography>
                  <Typography>姓名: {reservation.name}</Typography>
                  <Typography>電話: {reservation.phone}</Typography>
                  <Typography>日期: {reservation.date}</Typography>
                  <Typography>時間: {reservation.time}</Typography>
                  <Typography>人數: {reservation.people}</Typography>

                  {/* 修改表單（移除內層 form，避免 submit 被阻斷） */}
                  <Box sx={{ marginTop: 2 }}>
                    <TextField
                      label="姓名"
                      fullWidth
                      margin="normal"
                      value={reservation.name}
                      onChange={(e) =>
                        setReservation(prev => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                    <TextField
                      label="電話"
                      fullWidth
                      margin="normal"
                      value={reservation.phone}
                      onChange={(e) =>
                        setReservation(prev => ({ ...prev, phone: e.target.value }))
                      }
                      required
                    />
                    <TextField
                      label="日期"
                      type="date"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      value={reservation.date}
                      onChange={(e) =>
                        setReservation(prev => ({ ...prev, date: e.target.value }))
                      }
                      required
                      inputProps={{ min: todayStr }}
                    />
                    <TextField
                      label="時間"
                      type="time"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      value={reservation.time}
                      onChange={(e) =>
                        setReservation(prev => ({ ...prev, time: e.target.value }))
                      }
                      required
                      inputProps={{ step: 60, min: "00:00", max: "23:59" }}
                    />
                    <TextField
                      label="人數"
                      type="number"
                      fullWidth
                      margin="normal"
                      inputProps={{ min: 1 }}
                      value={reservation.people}
                      onChange={(e) =>
                        setReservation(prev => ({ ...prev, people: e.target.value }))
                      }
                      required
                    />

                    {/* 將取消按鈕和修改按鈕放在同一排，外層用 form 包裹，確保 submit 正常 */}
                    <Box
                      sx={{
                        marginTop: 2,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      component="form"
                      onSubmit={handleUpdate}
                    >
                      <Button type="submit" variant="contained" color="secondary">
                        更新訂位
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleCancel}
                      >
                        取消訂位
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box
          sx={{
            padding: 3,
            minHeight: '100vh',
            backgroundImage: "url('https://unsplash.com/photos/u2Lp8tXIcjw/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzY1NzE0ODE5fA&force=true')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 餐廳資訊內容 */}
          <Paper elevation={3} sx={{ padding: 4, marginBottom: 4, maxWidth: 600, width: '100%', backgroundColor: 'rgba(255,255,255,0.92)' }}>
            <Typography variant="h5" gutterBottom>
              {restaurantInfo.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {restaurantInfo.description}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>營業時間：</strong> {restaurantInfo.hours}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>地址：</strong> {restaurantInfo.address}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>電話：</strong> {restaurantInfo.phone}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>交通方式：</strong> {restaurantInfo.transport}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>停車資訊：</strong> {restaurantInfo.parking}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>付款方式：</strong> {restaurantInfo.payment}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>服務設施：</strong> {restaurantInfo.service}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>官方網站：</strong> <a href={restaurantInfo.website} target="_blank" rel="noopener noreferrer">{restaurantInfo.website}</a>
            </Typography>
            <Typography variant="h6" gutterBottom>
              菜單
            </Typography>
            <ul>
              {restaurantInfo.menu.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.price}
                </li>
              ))}
            </ul>
          </Paper>
        </Box>
      )}

      {/* Removed admin page content */}

      {/* 取代原本的聊天機器人按鈕區塊 */}
      <Box sx={{ position: "fixed", bottom: 16, right: 16, width: 320 }}>
        <Paper sx={{ padding: 2, mb: 1 }}>
          <TextField
            label="輸入訊息"
            fullWidth
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            multiline
            minRows={2}
            maxRows={4}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={sendMessage}
            disabled={!userMessage.trim()}
          >
            發送
          </Button>
        </Paper>
        <Paper sx={{ padding: 2, minWidth: 240, maxHeight: 200, overflow: 'auto' }}>
          <Typography variant="subtitle1">客服機器人回應：</Typography>
          <ReactMarkdown
            components={{
              p: ({node, ...props}) => <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginLeft: 16 }} {...props} />,
            }}
          >
            {chatResponse}
          </ReactMarkdown>
        </Paper>
      </Box>
    </>
  );
}

export default App;