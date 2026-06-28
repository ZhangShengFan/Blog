---
id: viewmodel-stateflow-migration
title: "ViewModel + StateFlow 最佳实践：替代 LiveData 的完整迁移指南"
excerpt: 从原理到实践，手把手带你把项目中的 LiveData 全面迁移到 StateFlow + SharedFlow，附完整代码和踩坑总结。
date: 2026-06-29
category: Android
tags:
  - Android
  - Kotlin
  - ViewModel
  - StateFlow
  - LiveData
  - Coroutines
coverImage: https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=1200&q=80
---

# ViewModel + StateFlow 最佳实践：替代 LiveData 的完整迁移指南

> 本文面向有一定 Android 开发基础、正在使用或准备迁移到 StateFlow 的开发者。全文包含完整可运行代码和详细注释，覆盖从 LiveData 迁移到 StateFlow 的每一个细节。

---

## 为什么要从 LiveData 迁移到 StateFlow？

LiveData 是 Android Jetpack 早期推出的可观察数据持有者，它与生命周期深度绑定，解决了内存泄漏问题。但随着 Kotlin 协程和 Flow 的成熟，LiveData 的局限性越来越明显：

- **只能在主线程观察**：LiveData 的 `observe` 只能在主线程调用，无法在后台线程直接收集
- **没有背压处理**：LiveData 不支持背压，高频数据更新会丢失中间值
- **转换操作符贫乏**：`map`、`switchMap` 功能有限，复杂数据流难以处理
- **不是 Kotlin-first**：LiveData 是 Java 时代的产物，和 Kotlin 协程生态融合不自然
- **测试复杂**：需要 `InstantTaskExecutorRule`，测试代码繁琐

相比之下，StateFlow / SharedFlow 是纯 Kotlin 协程生态的一部分，拥有完整的操作符、更好的类型安全和更简洁的测试方式。

---

## 核心概念速览

在迁移之前，先厘清几个概念：

| 概念 | 说明 |
|---|---|
| `Flow` | 冷流，订阅时才开始执行，适合一次性数据流 |
| `StateFlow` | 热流，始终持有最新值，适合 UI 状态 |
| `SharedFlow` | 热流，不持有状态，适合一次性事件（导航、Toast） |
| `MutableStateFlow` | 可写的 StateFlow，通常在 ViewModel 内部使用 |
| `MutableSharedFlow` | 可写的 SharedFlow，通常在 ViewModel 内部使用 |

**StateFlow 和 LiveData 的对应关系：**

```
LiveData<T>          →  StateFlow<T>
MutableLiveData<T>   →  MutableStateFlow<T>
```

---

## 一、项目依赖准备

在 `build.gradle.kts` 中确保有以下依赖：

```kotlin
dependencies {
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.0")
    // LiveData（迁移过渡期可保留）
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.8.0")
    // 协程
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    // 在 Compose 中收集 Flow（如果使用 Compose）
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.0")
}
```

---

## 二、最简单的迁移：单个状态值

### 迁移前（LiveData）

```kotlin
class UserViewModel : ViewModel() {

    // 对外暴露不可变 LiveData
    private val _userName = MutableLiveData<String>("")
    val userName: LiveData<String> = _userName

    fun updateName(name: String) {
        _userName.value = name  // 只能在主线程调用
        // 后台线程需用 postValue：_userName.postValue(name)
    }
}

// Fragment 中观察
class UserFragment : Fragment() {
    private val viewModel: UserViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        // observe 需要 LifecycleOwner，且只能在主线程
        viewModel.userName.observe(viewLifecycleOwner) { name ->
            binding.textName.text = name
        }
    }
}
```

### 迁移后（StateFlow）

```kotlin
class UserViewModel : ViewModel() {

    // MutableStateFlow 必须提供初始值
    // 命名约定：内部用 _xxx（可写），外部暴露 xxx（只读）
    private val _userName = MutableStateFlow("")
    val userName: StateFlow<String> = _userName.asStateFlow()
    // asStateFlow() 将 MutableStateFlow 转为只读的 StateFlow，防止外部修改

    fun updateName(name: String) {
        // StateFlow 的 value 可以在任何线程安全地修改
        _userName.value = name
    }
}

// Fragment 中收集
class UserFragment : Fragment() {
    private val viewModel: UserViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        // 使用 repeatOnLifecycle 确保在后台时停止收集，避免资源浪费
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.userName.collect { name ->
                    binding.textName.text = name
                }
            }
        }
    }
}
```

> ⚠️ **关键点**：一定要用 `repeatOnLifecycle(Lifecycle.State.STARTED)` 而不是直接 `lifecycleScope.launch { flow.collect {} }`。后者在 Activity/Fragment 进入后台时不会停止收集，可能导致崩溃或资源泄漏。

---

## 三、复杂 UI 状态管理：UiState 密封类

真实项目中，一个页面往往有加载中、成功、失败等多种状态。推荐用密封类（sealed class）或密封接口统一管理。

```kotlin
// 定义 UI 状态密封类
sealed class ArticleUiState {
    // 初始/空闲状态
    object Idle : ArticleUiState()
    // 加载中
    object Loading : ArticleUiState()
    // 加载成功，携带数据
    data class Success(val articles: List<Article>) : ArticleUiState()
    // 加载失败，携带错误信息
    data class Error(val message: String) : ArticleUiState()
}

class ArticleViewModel(
    private val repository: ArticleRepository
) : ViewModel() {

    // 初始状态设为 Idle
    private val _uiState = MutableStateFlow<ArticleUiState>(ArticleUiState.Idle)
    val uiState: StateFlow<ArticleUiState> = _uiState.asStateFlow()

    init {
        // ViewModel 创建时立即加载数据
        loadArticles()
    }

    fun loadArticles() {
        viewModelScope.launch {
            // 进入加载状态
            _uiState.value = ArticleUiState.Loading
            try {
                // repository.getArticles() 是一个挂起函数
                val articles = repository.getArticles()
                _uiState.value = ArticleUiState.Success(articles)
            } catch (e: Exception) {
                _uiState.value = ArticleUiState.Error(
                    message = e.message ?: "未知错误，请稍后重试"
                )
            }
        }
    }

    fun retry() {
        // 重置状态后重新加载
        loadArticles()
    }
}

// Fragment 中根据状态渲染不同 UI
class ArticleFragment : Fragment() {
    private val viewModel: ArticleViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    when (state) {
                        is ArticleUiState.Idle -> {
                            // 什么都不显示
                        }
                        is ArticleUiState.Loading -> {
                            binding.progressBar.isVisible = true
                            binding.recyclerView.isVisible = false
                            binding.errorView.isVisible = false
                        }
                        is ArticleUiState.Success -> {
                            binding.progressBar.isVisible = false
                            binding.recyclerView.isVisible = true
                            binding.errorView.isVisible = false
                            adapter.submitList(state.articles)
                        }
                        is ArticleUiState.Error -> {
                            binding.progressBar.isVisible = false
                            binding.recyclerView.isVisible = false
                            binding.errorView.isVisible = true
                            binding.errorText.text = state.message
                        }
                    }
                }
            }
        }
    }
}
```

---

## 四、一次性事件：用 SharedFlow 替代 SingleLiveEvent

LiveData 有一个常见痛点：屏幕旋转后，已经处理过的事件（如 Toast、导航）会再次触发。业界通常用 `SingleLiveEvent` 来解决，但它本质上是一个 Hack。

StateFlow 同样有这个问题（它会重放最新值）。正确的做法是用 **SharedFlow**：

```kotlin
class LoginViewModel : ViewModel() {

    // UI 状态（用 StateFlow，可以重放）
    private val _loginState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val loginState: StateFlow<LoginUiState> = _loginState.asStateFlow()

    // 一次性事件（用 SharedFlow，replay = 0 表示不重放）
    // extraBufferCapacity = 1 防止事件在没有订阅者时丢失
    private val _loginEvent = MutableSharedFlow<LoginEvent>(
        replay = 0,
        extraBufferCapacity = 1,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val loginEvent: SharedFlow<LoginEvent> = _loginEvent.asSharedFlow()

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _loginState.value = LoginUiState.Loading
            try {
                val user = repository.login(username, password)
                _loginState.value = LoginUiState.Success(user)
                // 发送一次性导航事件
                _loginEvent.emit(LoginEvent.NavigateToHome(user.id))
            } catch (e: AuthException) {
                _loginState.value = LoginUiState.Idle
                // 发送一次性 Toast 事件
                _loginEvent.emit(LoginEvent.ShowToast("用户名或密码错误"))
            }
        }
    }
}

// 一次性事件密封类
sealed class LoginEvent {
    data class NavigateToHome(val userId: String) : LoginEvent()
    data class ShowToast(val message: String) : LoginEvent()
}

// Fragment 中分别收集两个 Flow
class LoginFragment : Fragment() {
    private val viewModel: LoginViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                // 收集 UI 状态
                launch {
                    viewModel.loginState.collect { state ->
                        renderState(state)
                    }
                }
                // 收集一次性事件
                launch {
                    viewModel.loginEvent.collect { event ->
                        when (event) {
                            is LoginEvent.NavigateToHome -> {
                                findNavController().navigate(
                                    LoginFragmentDirections.toHome(event.userId)
                                )
                            }
                            is LoginEvent.ShowToast -> {
                                Toast.makeText(requireContext(), event.message, Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                }
            }
        }
    }
}
```

---

## 五、结合 Repository 层的完整数据流

实际项目中，数据通常来自 Repository，并且可能涉及数据库和网络请求的组合。

```kotlin
// Repository 层：暴露 Flow，让 ViewModel 来决定如何收集
class ArticleRepository(
    private val api: ArticleApi,          // 网络数据源
    private val dao: ArticleDao           // Room 数据库
) {

    // Room 的 Flow 是一个热流，数据库有变化时会自动发射新值
    fun getArticlesFromDb(): Flow<List<Article>> = dao.getAllArticles()

    // 网络请求是一个挂起函数（一次性操作）
    suspend fun fetchArticlesFromRemote(): Result<List<Article>> = runCatching {
        val response = api.getArticles()
        // 存入数据库，数据库的 Flow 会自动更新
        dao.insertAll(response.articles)
        response.articles
    }
}

// ViewModel 层：将 Repository 的 Flow 转换为 StateFlow
class ArticleViewModel(
    private val repository: ArticleRepository
) : ViewModel() {

    // stateIn 将冷的 Flow 转换为热的 StateFlow
    // SharingStarted.WhileSubscribed(5000)：当没有订阅者 5 秒后停止上游，
    // 这个 5 秒宽限期是为了处理屏幕旋转等短暂的无订阅者情况
    val articles: StateFlow<List<Article>> = repository
        .getArticlesFromDb()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList()
        )

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val _error = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val error: SharedFlow<String> = _error.asSharedFlow()

    // 手动刷新
    fun refresh() {
        viewModelScope.launch {
            _isRefreshing.value = true
            repository.fetchArticlesFromRemote()
                .onFailure { e ->
                    _error.emit(e.message ?: "刷新失败")
                }
            _isRefreshing.value = false
        }
    }
}
```

---

## 六、在 Jetpack Compose 中使用

Compose 提供了 `collectAsStateWithLifecycle`，它会自动在生命周期非活跃时停止收集：

```kotlin
// 需要依赖：androidx.lifecycle:lifecycle-runtime-compose
@Composable
fun ArticleScreen(
    viewModel: ArticleViewModel = hiltViewModel()
) {
    // collectAsStateWithLifecycle 会在 Lifecycle.State.STARTED 时收集
    // 这等价于传统 View 中的 repeatOnLifecycle(STARTED)
    val articles by viewModel.articles.collectAsStateWithLifecycle()
    val isRefreshing by viewModel.isRefreshing.collectAsStateWithLifecycle()

    // 一次性事件用 LaunchedEffect 处理
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(Unit) {
        viewModel.error.collect { message ->
            snackbarHostState.showSnackbar(message)
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        SwipeRefresh(
            state = rememberSwipeRefreshState(isRefreshing),
            onRefresh = { viewModel.refresh() },
            modifier = Modifier.padding(padding)
        ) {
            LazyColumn {
                items(articles) { article ->
                    ArticleItem(article)
                }
            }
        }
    }
}
```

---

## 七、单元测试

StateFlow 的测试比 LiveData 简洁很多，不再需要 `InstantTaskExecutorRule`：

```kotlin
// 测试依赖
// testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
// testImplementation("app.cash.turbine:turbine:1.1.0")  // Turbine 库简化 Flow 测试

class ArticleViewModelTest {

    // 用 TestScope 替代真实的协程调度器，可以精确控制时间
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `loadArticles success - uiState should be Success`() = runTest {
        // 准备假的 Repository
        val fakeRepository = FakeArticleRepository(
            articlesResult = Result.success(listOf(Article(id = "1", title = "测试文章")))
        )
        val viewModel = ArticleViewModel(fakeRepository)

        // 使用 Turbine 库收集 Flow 值
        viewModel.uiState.test {
            // 初始值是 Idle
            assertThat(awaitItem()).isInstanceOf(ArticleUiState.Idle::class.java)
            // 触发加载
            viewModel.loadArticles()
            // 加载中
            assertThat(awaitItem()).isInstanceOf(ArticleUiState.Loading::class.java)
            // 成功
            val success = awaitItem()
            assertThat(success).isInstanceOf(ArticleUiState.Success::class.java)
            assertThat((success as ArticleUiState.Success).articles).hasSize(1)
        }
    }

    @Test
    fun `loadArticles failure - uiState should be Error`() = runTest {
        val fakeRepository = FakeArticleRepository(
            articlesResult = Result.failure(Exception("网络错误"))
        )
        val viewModel = ArticleViewModel(fakeRepository)

        viewModel.uiState.test {
            assertThat(awaitItem()).isInstanceOf(ArticleUiState.Idle::class.java)
            viewModel.loadArticles()
            assertThat(awaitItem()).isInstanceOf(ArticleUiState.Loading::class.java)
            val error = awaitItem()
            assertThat(error).isInstanceOf(ArticleUiState.Error::class.java)
            assertThat((error as ArticleUiState.Error).message).isEqualTo("网络错误")
        }
    }
}
```

---

## 八、迁移检查清单

完成迁移后，用这个清单自检：

- [ ] 所有 `MutableLiveData` 替换为 `MutableStateFlow`（提供初始值）
- [ ] 所有 `LiveData` 替换为 `StateFlow`，并调用 `.asStateFlow()`
- [ ] Fragment/Activity 中改用 `repeatOnLifecycle(STARTED)` 收集
- [ ] Compose 中改用 `collectAsStateWithLifecycle()`
- [ ] 一次性事件（导航、Toast）改用 `SharedFlow(replay = 0)`
- [ ] 来自 Repository 的 Flow 用 `stateIn(WhileSubscribed(5000))` 转换
- [ ] 删除 `InstantTaskExecutorRule`，改用 `StandardTestDispatcher`
- [ ] 删除不再需要的 `lifecycle-livedata-ktx` 依赖（如果已完全迁移）

---

## 总结

LiveData 并没有错，但它属于另一个时代。StateFlow 是 Kotlin 协程生态中更自然的选择，拥有更强大的操作符、更好的可测试性和更清晰的数据流语义。迁移成本并不高，核心就是三点：**StateFlow 管状态、SharedFlow 管事件、repeatOnLifecycle 管生命周期**。
