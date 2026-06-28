---
id: jetpack-compose-animation
title: "Jetpack Compose 动画实战：从 animateFloatAsState 到自定义 Transition"
excerpt: 从最简单的状态驱动动画出发，逐步深入到 Transition、AnimatedContent、自定义动画规格，附完整代码和注释，带你掌握 Compose 动画体系。
date: 2026-06-29
category: 技术
tags:
  - Android
  - Jetpack Compose
  - Animation
  - Kotlin
  - UI
coverImage: https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80
---

# Jetpack Compose 动画实战：从 animateFloatAsState 到自定义 Transition

> 本文从最简单的单值动画出发，逐层深入 Compose 动画体系，每个知识点都附有完整可运行代码和详细注释。读完本文，你将能独立实现从入门到进阶的各类 Compose 动画效果。

---

## Compose 动画体系总览

Compose 的动画 API 分为几个层级，由简到繁：

```
高级 API（推荐首选）
  ├── animateXxxAsState        // 单个值的状态动画
  ├── AnimatedVisibility       // 进入/退出动画
  ├── AnimatedContent          // 内容切换动画
  └── Crossfade                // 淡入淡出切换

中级 API
  ├── updateTransition         // 多值同步动画（Transition）
  └── rememberInfiniteTransition  // 无限循环动画

低级 API（完全自定义）
  ├── Animatable               // 手动控制单个动画值
  └── Animation / AnimationSpec  // 动画规格（spring、tween、keyframes）
```

一般情况下，优先使用高级 API，只有在需要精确控制时才下探到低级 API。

---

## 一、animateFloatAsState：最简单的入门动画

`animateXxxAsState` 是一组函数，包括 `animateFloatAsState`、`animateDpAsState`、`animateColorAsState` 等，用于驱动单个值的动画过渡。

### 基础用法：透明度切换

```kotlin
@Composable
fun FadeButton() {
    // 用 remember 保存一个布尔状态
    var visible by remember { mutableStateOf(true) }

    // animateFloatAsState 监听 visible 的变化
    // 当 visible 变化时，alpha 会以动画形式从当前值过渡到目标值
    // targetValue：目标值，visible 为 true 时透明度为 1f，否则为 0.3f
    val alpha by animateFloatAsState(
        targetValue = if (visible) 1f else 0.3f,
        label = "fadeAlpha"   // label 用于 Android Studio 动画预览工具识别
    )

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(Color(0xFF6200EE), RoundedCornerShape(16.dp))
                // graphicsLayer 比直接用 alpha modifier 性能更好
                // 它在 GPU 层面操作，不触发重组
                .graphicsLayer { this.alpha = alpha }
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { visible = !visible }) {
            Text(if (visible) "淡出" else "淡入")
        }
    }
}
```

### 自定义动画规格（AnimationSpec）

```kotlin
@Composable
fun AnimatedCard() {
    var expanded by remember { mutableStateOf(false) }

    // animateDpAsState：Dp 类型的状态动画
    val cardHeight by animateDpAsState(
        targetValue = if (expanded) 200.dp else 80.dp,
        // tween：基于时间的线性插值动画
        // durationMillis：动画时长（毫秒）
        // easing：缓动曲线，FastOutSlowInEasing 是 Material 推荐的标准曲线
        animationSpec = tween(
            durationMillis = 400,
            easing = FastOutSlowInEasing
        ),
        label = "cardHeight"
    )

    // animateColorAsState：颜色动画
    val cardColor by animateColorAsState(
        targetValue = if (expanded) Color(0xFF3700B3) else Color(0xFF6200EE),
        animationSpec = tween(durationMillis = 400),
        label = "cardColor"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(cardHeight)
            .clickable { expanded = !expanded },
        colors = CardDefaults.cardColors(containerColor = cardColor),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
            Text(
                text = if (expanded) "点击收起" else "点击展开",
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
```

### Spring 弹簧动画

```kotlin
@Composable
fun SpringButton() {
    var pressed by remember { mutableStateOf(false) }

    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.85f else 1f,
        // spring：物理弹簧动画，比 tween 更自然
        // dampingRatio：阻尼比。越小弹性越大，1f 完全不弹
        //   Spring.DampingRatioHighBouncy = 0.2f（高弹性）
        //   Spring.DampingRatioMediumBouncy = 0.5f（中弹性）
        //   Spring.DampingRatioNoBouncy = 1f（无弹性）
        // stiffness：刚度。越大动画越快
        //   Spring.StiffnessHigh = 10000f
        //   Spring.StiffnessMedium = 1500f（默认）
        //   Spring.StiffnessLow = 200f
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMedium
        ),
        label = "buttonScale"
    )

    Button(
        onClick = {},
        modifier = Modifier
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        pressed = true
                        tryAwaitRelease()  // 等待手指抬起
                        pressed = false
                    }
                )
            }
    ) {
        Text("按住试试")
    }
}
```

---

## 二、AnimatedVisibility：进入和退出动画

`AnimatedVisibility` 控制组件的显示和隐藏，内置了多种进入/退出动画效果。

```kotlin
@Composable
fun NotificationBanner() {
    var showBanner by remember { mutableStateOf(false) }

    Column {
        // AnimatedVisibility 根据 visible 参数决定是否显示内容
        AnimatedVisibility(
            visible = showBanner,
            // enter：出现时的动画，多个动画用 + 组合
            enter = slideInVertically(
                // 从顶部滑入：initialOffsetY 为负值表示从上方
                initialOffsetY = { -it },
                animationSpec = spring(dampingRatio = Spring.DampingRatioLowBouncy)
            ) + fadeIn(
                // 同时淡入
                animationSpec = tween(durationMillis = 300)
            ),
            // exit：消失时的动画
            exit = slideOutVertically(
                targetOffsetY = { -it }
            ) + fadeOut()
        ) {
            // 这里的内容会在 visible = true 时以动画出现，false 时以动画消失
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                color = Color(0xFF4CAF50),
                shape = RoundedCornerShape(12.dp),
                shadowElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("操作成功！", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }

        Button(
            onClick = { showBanner = !showBanner },
            modifier = Modifier.padding(16.dp)
        ) {
            Text(if (showBanner) "隐藏通知" else "显示通知")
        }
    }
}
```

### 常用进入/退出动画速查

```kotlin
// 进入动画
fadeIn()                                  // 淡入
slideInHorizontally { -it }               // 从左侧滑入
slideInVertically { -it }                 // 从顶部滑入
scaleIn(initialScale = 0.8f)              // 缩放放大进入
expandHorizontally()                      // 水平展开
expandVertically()                        // 垂直展开

// 退出动画
fadeOut()                                 // 淡出
slideOutHorizontally { it }               // 向右滑出
slideOutVertically { it }                 // 向底部滑出
scaleOut(targetScale = 0.8f)             // 缩放缩小退出
shrinkHorizontally()                      // 水平收缩
shrinkVertically()                        // 垂直收缩
```

---

## 三、AnimatedContent：内容切换动画

当内容本身发生变化时（不只是显示/隐藏），用 `AnimatedContent`。

```kotlin
@Composable
fun CounterWithAnimation() {
    var count by remember { mutableIntStateOf(0) }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        AnimatedContent(
            targetState = count,
            // transitionSpec 定义切换时的动画
            transitionSpec = {
                // initialState 是旧值，targetState 是新值
                if (targetState > initialState) {
                    // 数字增加：新数字从下方滑入，旧数字向上滑出
                    slideInVertically { it } + fadeIn() togetherWith
                            slideOutVertically { -it } + fadeOut()
                } else {
                    // 数字减少：新数字从上方滑入，旧数字向下滑出
                    slideInVertically { -it } + fadeIn() togetherWith
                            slideOutVertically { it } + fadeOut()
                }.using(
                    // SizeTransform 控制内容尺寸的过渡方式
                    // clip = false 允许内容在动画期间超出边界显示
                    SizeTransform(clip = false)
                )
            },
            label = "counterAnimation"
        ) { targetCount ->
            // 注意：这里的 targetCount 是动画的目标值
            // Compose 会同时渲染新旧两个内容，各自应用进入/退出动画
            Text(
                text = "$targetCount",
                fontSize = 48.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF6200EE)
            )
        }

        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Button(onClick = { count-- }) { Text("-") }
            Button(onClick = { count++ }) { Text("+") }
        }
    }
}
```

---

## 四、updateTransition：多值同步的 Transition

当需要多个值同步动画（比如一个按钮同时改变颜色、大小、形状），用 `updateTransition` 是最优解。

```kotlin
// 定义状态枚举
enum class ButtonState { Idle, Pressed, Loading, Success }

@Composable
fun MultiStateButton() {
    var buttonState by remember { mutableStateOf(ButtonState.Idle) }

    // updateTransition 创建一个 Transition 对象，跟踪 buttonState 的变化
    // label 用于调试工具识别
    val transition = updateTransition(
        targetState = buttonState,
        label = "buttonTransition"
    )

    // 用 transition.animateXxx 定义各个属性的动画
    // 每个属性的 transitionSpec 可以单独配置

    val buttonColor by transition.animateColor(
        transitionSpec = {
            // when (initialState to targetState) 可以针对特定状态转换定制动画
            when {
                initialState == ButtonState.Idle && targetState == ButtonState.Pressed ->
                    tween(durationMillis = 100)
                targetState == ButtonState.Success ->
                    tween(durationMillis = 600)
                else -> tween(durationMillis = 300)
            }
        },
        label = "buttonColor"
    ) { state ->
        // 根据目标状态返回对应颜色
        when (state) {
            ButtonState.Idle -> Color(0xFF6200EE)
            ButtonState.Pressed -> Color(0xFF3700B3)
            ButtonState.Loading -> Color(0xFF9E9E9E)
            ButtonState.Success -> Color(0xFF4CAF50)
        }
    }

    val buttonWidth by transition.animateDp(
        transitionSpec = { spring(dampingRatio = Spring.DampingRatioMediumBouncy) },
        label = "buttonWidth"
    ) { state ->
        when (state) {
            ButtonState.Loading, ButtonState.Success -> 56.dp  // 圆形按钮
            else -> 200.dp
        }
    }

    val cornerRadius by transition.animateDp(
        transitionSpec = { tween(durationMillis = 300) },
        label = "cornerRadius"
    ) { state ->
        when (state) {
            ButtonState.Loading, ButtonState.Success -> 28.dp  // 完全圆角
            else -> 12.dp
        }
    }

    val textAlpha by transition.animateFloat(
        transitionSpec = { tween(durationMillis = 200) },
        label = "textAlpha"
    ) { state ->
        // Loading 和 Success 状态隐藏文字
        if (state == ButtonState.Idle || state == ButtonState.Pressed) 1f else 0f
    }

    Box(
        modifier = Modifier
            .width(buttonWidth)
            .height(56.dp)
            .background(buttonColor, RoundedCornerShape(cornerRadius))
            .clickable {
                // 模拟异步操作
                if (buttonState == ButtonState.Idle) {
                    buttonState = ButtonState.Loading
                    // 实际项目中这里会触发 ViewModel 的操作
                }
            },
        contentAlignment = Alignment.Center
    ) {
        // 文字（在 Idle/Pressed 时显示）
        Text(
            text = "提交",
            color = Color.White,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.graphicsLayer { alpha = textAlpha }
        )

        // Loading 指示器（在 Loading 时显示）
        if (buttonState == ButtonState.Loading) {
            CircularProgressIndicator(
                color = Color.White,
                strokeWidth = 2.dp,
                modifier = Modifier.size(24.dp)
            )
        }

        // 成功图标（在 Success 时显示）
        if (buttonState == ButtonState.Success) {
            Icon(
                Icons.Default.Check,
                contentDescription = "成功",
                tint = Color.White,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}
```

---

## 五、rememberInfiniteTransition：无限循环动画

适合心跳、呼吸灯、加载中等需要持续运行的动画。

```kotlin
@Composable
fun PulsingDot() {
    // 创建一个无限循环的 Transition
    val infiniteTransition = rememberInfiniteTransition(label = "pulsing")

    // 定义一个在 0.6f 到 1f 之间无限循环的 Float 值
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            // tween：单次动画规格
            animation = tween(durationMillis = 800, easing = FastOutSlowInEasing),
            // RepeatMode.Reverse：来回反复（0.6→1→0.6→1...）
            // RepeatMode.Restart：重新开始（0.6→1→0.6→1...，但跳回而不是反向）
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    val color by infiniteTransition.animateColor(
        initialValue = Color(0xFF6200EE).copy(alpha = 0.4f),
        targetValue = Color(0xFF6200EE),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseColor"
    )

    Box(
        modifier = Modifier
            .size(24.dp)
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .background(color, CircleShape)
    )
}

// 更实用的例子：骨架屏（Shimmer 效果）
@Composable
fun ShimmerBox(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")

    // 让光泽效果从左到右扫过
    val shimmerTranslateAnim by infiniteTransition.animateFloat(
        initialValue = -1000f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerTranslate"
    )

    val shimmerColors = listOf(
        Color.LightGray.copy(alpha = 0.6f),
        Color.LightGray.copy(alpha = 0.2f),
        Color.LightGray.copy(alpha = 0.6f)
    )

    Box(
        modifier = modifier
            .background(
                brush = Brush.linearGradient(
                    colors = shimmerColors,
                    start = Offset(shimmerTranslateAnim - 500f, 0f),
                    end = Offset(shimmerTranslateAnim + 500f, 0f)
                ),
                shape = RoundedCornerShape(8.dp)
            )
    )
}
```

---

## 六、Animatable：低级 API，完全手动控制

当需要根据手势、物理效果或复杂逻辑控制动画时，使用 `Animatable`。

```kotlin
@Composable
fun DraggableCard() {
    // Animatable 持有一个可动画化的值，初始值为 0f
    val offsetX = remember { Animatable(0f) }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .size(200.dp, 120.dp)
                // 根据 offsetX 偏移卡片
                .offset { IntOffset(offsetX.value.roundToInt(), 0) }
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDrag = { _, dragAmount ->
                            coroutineScope.launch {
                                // snapTo：立即跳到目标值（无动画）
                                offsetX.snapTo(offsetX.value + dragAmount.x)
                            }
                        },
                        onDragEnd = {
                            coroutineScope.launch {
                                // 判断是否超过阈值，决定是弹回还是飞出
                                if (kotlin.math.abs(offsetX.value) < 150f) {
                                    // animateTo：动画过渡到目标值
                                    // 弹回中心
                                    offsetX.animateTo(
                                        targetValue = 0f,
                                        animationSpec = spring(
                                            dampingRatio = Spring.DampingRatioMediumBouncy
                                        )
                                    )
                                } else {
                                    // 飞出屏幕
                                    val target = if (offsetX.value > 0) 1000f else -1000f
                                    offsetX.animateTo(
                                        targetValue = target,
                                        animationSpec = tween(durationMillis = 300)
                                    )
                                }
                            }
                        }
                    )
                },
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                Text("← 拖拽我 →", fontWeight = FontWeight.Bold)
            }
        }
    }
}
```

---

## 七、keyframes：关键帧动画

需要在动画过程中的特定时间点精确控制值时，用 `keyframes`：

```kotlin
@Composable
fun BounceButton() {
    var clicked by remember { mutableStateOf(false) }

    val scale by animateFloatAsState(
        targetValue = if (clicked) 1f else 1f,  // 起止值相同，靠 keyframes 控制过程
        animationSpec = keyframes {
            durationMillis = 600  // 总动画时长

            // 格式：值 at 时间点（毫秒）
            1f at 0       // 0ms：原始大小
            1.3f at 100   // 100ms：放大到 1.3 倍
            0.9f at 200   // 200ms：缩小到 0.9 倍
            1.1f at 300   // 300ms：回弹到 1.1 倍
            0.95f at 400  // 400ms：再次收缩
            1f at 500     // 500ms：恢复原始大小
        },
        finishedListener = {
            clicked = false  // 动画结束后重置，允许再次触发
        },
        label = "bounceScale"
    )

    Button(
        onClick = { clicked = true },
        modifier = Modifier.graphicsLayer { scaleX = scale; scaleY = scale }
    ) {
        Text("点我弹一下")
    }
}
```

---

## 八、动画性能优化要点

```kotlin
// ✅ 推荐：用 graphicsLayer 修改视觉属性（在 GPU 层操作，不触发重组）
Modifier.graphicsLayer {
    alpha = animatedAlpha
    scaleX = animatedScale
    scaleY = animatedScale
    translationX = animatedOffset
    rotationZ = animatedRotation
}

// ❌ 避免：直接用 alpha/scale modifier（会触发重组）
Modifier.alpha(animatedAlpha)  // 性能较差

// ✅ 推荐：动画值在 Layout/Draw 阶段读取，避免影响重组
// derivedStateOf 在动画值变化时不会触发整个组件重组
val isVisible by remember {
    derivedStateOf { animatedOffset > 0f }
}

// ✅ 推荐：为 animateXxxAsState 提供 label，方便调试
val alpha by animateFloatAsState(targetValue = 1f, label = "cardAlpha")
```

---

## 总结

Compose 的动画体系设计非常清晰：**用什么场景选什么 API**。

| 场景 | 推荐 API |
|---|---|
| 单个值（透明度、大小、颜色）随状态变化 | `animateXxxAsState` |
| 组件显示/隐藏 | `AnimatedVisibility` |
| 内容本身切换（不同文字、不同组件） | `AnimatedContent` / `Crossfade` |
| 多个值需要同步动画 | `updateTransition` |
| 持续循环的动画 | `rememberInfiniteTransition` |
| 手势驱动、物理效果、复杂控制 | `Animatable` |
| 特定时间点精确控制 | `keyframes` |

掌握了这张表，Compose 动画就基本无难题了。
