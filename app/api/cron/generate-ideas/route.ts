import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Mr Idea user configuration
const MR_IDEA_USER = {
  email: 'mr.idea@ideavault.ai',
  name: 'Mr Idea 🤖',
  image: 'https://api.dicebear.com/7.x/bottts/svg?seed=mridea&backgroundColor=6366f1',
};

// Idea templates organized by category
const IDEA_TEMPLATES = {
  tools: [
    {
      title: 'Công cụ AI tóm tắt họp online tự động',
      description: `## Vấn đề
Mỗi ngày chúng ta phải tham gia rất nhiều cuộc họp online, nhưng việc ghi chép và tóm tắt nội dung họp rất mất thời gian.

## Giải pháp
Xây dựng một công cụ AI tự động:
- Ghi âm và chuyển đổi giọng nói thành văn bản
- Tóm tắt các điểm chính của cuộc họp
- Trích xuất action items và deadline
- Gửi email tóm tắt cho tất cả người tham gia

## Tính năng chính
- Tích hợp Zoom, Google Meet, Microsoft Teams
- AI phân biệt người nói
- Dashboard theo dõi các task từ meeting
- Export PDF/Word`,
    },
    {
      title: 'Browser extension phát hiện fake news bằng AI',
      description: `## Vấn đề
Tin giả tràn lan trên mạng xã hội, rất khó để người dùng thường phân biệt.

## Giải pháp
Extension trình duyệt sử dụng AI để:
- Phân tích nội dung bài viết real-time
- So sánh với các nguồn tin uy tín
- Đánh giá độ tin cậy (score 0-100)
- Hiển thị cảnh báo trực quan

## Tính năng
- Hoạt động trên Facebook, Twitter, News sites
- Cộng đồng report tin giả
- Lịch sử kiểm tra
- Badge tin cậy cho các trang web`,
    },
    {
      title: 'Công cụ quản lý thời gian cho freelancer Việt Nam',
      description: `## Vấn đề
Freelancer Việt Nam thường làm việc với nhiều client ở các múi giờ khác nhau, khó quản lý deadline và invoice.

## Giải pháp
Ứng dụng all-in-one cho freelancer:
- Time tracking tự động theo project
- Chuyển đổi múi giờ thông minh
- Tạo invoice tự động (VND/USD)
- Báo cáo thu nhập theo tháng

## Tính năng
- Tích hợp với các platform freelance
- Nhắc nhở deadline thông minh
- Template hợp đồng mẫu
- Dashboard phân tích năng suất`,
    },
    {
      title: 'CLI tool quản lý dotfiles và dev environment',
      description: `## Vấn đề
Developer thường mất nhiều thời gian setup môi trường làm việc khi đổi máy hoặc làm nhiều dự án.

## Giải pháp
CLI tool giúp:
- Sync dotfiles qua cloud
- One-command setup environment
- Quản lý các tool versions (Node, Python, etc.)
- Backup/restore settings IDE

## Tính năng
- Cross-platform (Mac, Linux, Windows WSL)
- Template cho các stack phổ biến
- Conflict resolution thông minh
- Plugin system mở rộng`,
    },
    {
      title: 'Tool kiểm tra và tối ưu SEO cho website Việt',
      description: `## Vấn đề
Các website Việt Nam thường có vấn đề về SEO do không hiểu rõ về kỹ thuật và tiếng Việt có dấu.

## Giải pháp
Tool phân tích SEO chuyên cho tiếng Việt:
- Audit on-page SEO
- Kiểm tra từ khóa tiếng Việt
- Đề xuất cải thiện content
- So sánh với đối thủ

## Tính năng
- Crawl toàn bộ website
- Báo cáo chi tiết từng trang
- Đề xuất title/meta description
- Theo dõi ranking theo thời gian`,
    },
  ],
  apps: [
    {
      title: 'App đặt lịch cắt tóc và làm đẹp thông minh',
      description: `## Vấn đề
Việc đặt lịch cắt tóc, nail, spa ở Việt Nam vẫn còn rất thủ công - gọi điện, nhắn tin, chờ xác nhận.

## Giải pháp
Super app cho ngành làm đẹp:
- Đặt lịch online 24/7
- Xem portfolio thợ làm tóc
- So sánh giá các tiệm
- Thanh toán online

## Tính năng
- Map view các tiệm gần nhà
- Review và rating chi tiết
- Loyalty program tích điểm
- Reminder nhắc lịch hẹn`,
    },
    {
      title: 'Ứng dụng học tiếng Anh qua meme và video ngắn',
      description: `## Vấn đề
Học tiếng Anh truyền thống nhàm chán, không gắn với văn hóa và ngôn ngữ thực tế.

## Giải pháp
App học tiếng Anh theo kiểu Gen Z:
- Học từ vựng qua meme viral
- Video ngắn giải thích slang
- Quiz tương tác vui nhộn
- Cộng đồng thực hành

## Tính năng
- Content update hàng ngày
- AI đề xuất theo trình độ
- Streak và achievement system
- Thi đấu với bạn bè`,
    },
    {
      title: 'App chia sẻ đồ ăn thừa trong khu phố',
      description: `## Vấn đề
Lượng thức ăn thừa ở các gia đình, nhà hàng rất lớn trong khi nhiều người còn khó khăn.

## Giải pháp
Nền tảng chia sẻ đồ ăn cộng đồng:
- Đăng đồ ăn thừa còn tốt
- Người cần có thể đến lấy free
- Nhà hàng đăng đồ ăn sắp hết hạn
- Kết nối với các tổ chức từ thiện

## Tính năng
- Định vị theo khu vực
- Chat trong app
- Hệ thống đánh giá người dùng
- Thống kê đồ ăn đã cứu`,
    },
    {
      title: 'App tìm việc làm thêm cho sinh viên',
      description: `## Vấn đề
Sinh viên khó tìm việc làm thêm phù hợp lịch học, nhiều công việc lừa đảo.

## Giải pháp
Platform việc làm thêm dành riêng cho sinh viên:
- Công việc linh hoạt theo giờ
- Xác minh nhà tuyển dụng
- Filter theo trường/khu vực
- Đánh giá từ sinh viên khác

## Tính năng
- Lịch quản lý ca làm
- Nhận lương qua app
- Kết nối với career center trường
- Certificate khi hoàn thành`,
    },
    {
      title: 'App quản lý tài chính cá nhân cho người trẻ Việt',
      description: `## Vấn đề
Người trẻ Việt Nam thiếu thói quen quản lý tài chính, chi tiêu không kiểm soát.

## Giải pháp
App quản lý tiền dễ dùng, giao diện trẻ trung:
- Kết nối ngân hàng Việt Nam
- Tự động phân loại chi tiêu
- Mục tiêu tiết kiệm gamified
- Đề xuất đầu tư cơ bản

## Tính năng
- Dashboard trực quan
- Alert chi tiêu bất thường
- Chia bill với bạn bè
- Báo cáo hàng tuần/tháng`,
    },
  ],
  games: [
    {
      title: 'Game mobile về lịch sử Việt Nam cho trẻ em',
      description: `## Vấn đề
Trẻ em ít hứng thú với môn lịch sử do cách dạy khô khan, thiếu sinh động.

## Giải pháp
Game mobile học lịch sử Việt Nam:
- Storyline theo các triều đại
- Chiến đấu với boss ngoại xâm
- Thu thập nhân vật lịch sử
- Quiz kiểm tra kiến thức

## Tính năng
- Đồ họa 2D cute
- Giọng lồng tiếng chuyên nghiệp
- Multiplayer thi đấu
- Cập nhật event theo ngày lễ`,
    },
    {
      title: 'Game quản lý quán cà phê Việt Nam',
      description: `## Vấn đề
Thiếu game simulation về văn hóa Việt Nam, đặc biệt là văn hóa cà phê.

## Giải pháp
Game quản lý quán cà phê kiểu Việt:
- Xây dựng và trang trí quán
- Pha chế các loại cà phê Việt
- Quản lý nhân viên
- Mở rộng chuỗi

## Tính năng
- Công thức cà phê thực tế
- Khách hàng với tính cách khác nhau
- Event theo mùa
- PvP doanh thu với bạn bè`,
    },
    {
      title: 'Game đố vui kiến thức tổng hợp tiếng Việt',
      description: `## Vấn đề
Thiếu game đố vui chất lượng bằng tiếng Việt với nội dung đa dạng.

## Giải pháp
Trivia game với nhiều chủ đề:
- Lịch sử, địa lý Việt Nam
- Văn hóa pop, âm nhạc
- Khoa học, công nghệ
- Thể thao, giải trí

## Tính năng
- Battle mode 1v1
- Tournament hàng tuần
- Leaderboard quốc gia
- User-generated questions`,
    },
  ],
  business: [
    {
      title: 'Platform quản lý chuỗi cửa hàng F&B cho SME',
      description: `## Vấn đề
Các chuỗi F&B nhỏ tại Việt Nam không có tool quản lý phù hợp, các phần mềm nước ngoài quá đắt.

## Giải pháp
Nền tảng quản lý all-in-one:
- POS bán hàng
- Quản lý inventory
- Báo cáo doanh thu real-time
- Quản lý nhân sự

## Tính năng
- Dashboard multi-store
- App cho staff
- Tích hợp delivery apps
- Giá phù hợp SME Việt Nam`,
    },
    {
      title: 'Marketplace cho nông sản Việt Nam - Farm to Table',
      description: `## Vấn đề
Nông dân bán nông sản qua nhiều khâu trung gian, người tiêu dùng không biết nguồn gốc.

## Giải pháp
Sàn TMĐT kết nối nông dân - người tiêu dùng:
- Đặt hàng trực tiếp từ nông trại
- Truy xuất nguồn gốc QR code
- Giao hàng trong ngày
- Subscription box rau củ tuần

## Tính năng
- Live stream từ vườn
- Đánh giá chất lượng
- Hỗ trợ nông dân marketing
- Partnership với organic farms`,
    },
    {
      title: 'SaaS tự động hóa marketing cho shop online Việt',
      description: `## Vấn đề
Chủ shop online mất nhiều thời gian chạy ads, trả lời khách, quản lý đơn hàng.

## Giải pháp
Tool automation all-in-one:
- Chatbot trả lời tự động
- Tự động đăng bài các kênh
- Retargeting thông minh
- Phân tích hiệu quả ads

## Tính năng
- Tích hợp Shopee, Lazada, TikTok Shop
- Template tin nhắn thông minh
- A/B testing tự động
- Báo cáo ROI chi tiết`,
    },
    {
      title: 'Platform đào tạo online cho doanh nghiệp Việt',
      description: `## Vấn đề
Doanh nghiệp Việt khó tìm nền tảng LMS phù hợp văn hóa và ngân sách.

## Giải pháp
LMS thiết kế riêng cho doanh nghiệp Việt:
- Tạo khóa học nội bộ
- Quiz và đánh giá nhân viên
- Certificate tự động
- Tracking learning path

## Tính năng
- Mobile-first design
- Gamification tích điểm
- Analytics chi tiết
- Tích hợp HRMS`,
    },
  ],
  design: [
    {
      title: 'Tool tạo mockup sản phẩm Việt Nam',
      description: `## Vấn đề
Designer Việt khó tìm mockup phù hợp với sản phẩm và bối cảnh Việt Nam.

## Giải pháp
Nền tảng mockup made-in-Vietnam:
- Template mockup sản phẩm Việt
- Bối cảnh đường phố, quán cafe Việt
- Model người Việt
- Customize trực tiếp online

## Tính năng
- Drag & drop design
- Export high-res
- Library cập nhật hàng tuần
- API cho tích hợp`,
    },
    {
      title: 'AI tool chuyển đổi sketch thành UI design',
      description: `## Vấn đề
Designer mất nhiều thời gian chuyển từ sketch tay sang design file chính xác.

## Giải pháp
AI tool nhận diện sketch và tạo UI:
- Upload ảnh sketch
- AI nhận diện components
- Xuất ra Figma/Sketch file
- Suggest design system

## Tính năng
- Nhận diện handwriting notes
- Multiple export formats
- Component library
- Collaboration features`,
    },
    {
      title: 'Platform thiết kế thiệp và ấn phẩm cho sự kiện Việt',
      description: `## Vấn đề
Người Việt khó tìm template đẹp cho thiệp cưới, sinh nhật với phong cách Việt.

## Giải pháp
Canva phiên bản Việt cho sự kiện:
- Template thiệp cưới truyền thống/hiện đại
- Thiệp mời sinh nhật, đầy tháng
- Menu nhà hàng tiệc cưới
- Backdrop và banner

## Tính năng
- Font tiếng Việt đẹp
- In ấn trực tiếp
- Chia sẻ online
- Animation cho thiệp điện tử`,
    },
  ],
  education: [
    {
      title: 'Platform luyện thi IELTS với AI tutor',
      description: `## Vấn đề
Học IELTS tốn kém, khó tìm người luyện speaking, feedback writing chậm.

## Giải pháp
Nền tảng luyện IELTS với AI:
- AI chấm speaking real-time
- Writing feedback chi tiết
- Đề thi thử cập nhật
- Learning path cá nhân hóa

## Tính năng
- Voice analysis cho phát âm
- Grammar correction chi tiết
- Progress tracking
- 1-on-1 với tutor thật (premium)`,
    },
    {
      title: 'App học lập trình cho trẻ em Việt Nam',
      description: `## Vấn đề
Trẻ em Việt ít có cơ hội tiếp cận coding, các app nước ngoài không phù hợp.

## Giải pháp
App dạy coding tiếng Việt cho trẻ 6-12 tuổi:
- Học qua game và puzzle
- Block-based programming
- Dự án tạo game đơn giản
- Certificate cho phụ huynh

## Tính năng
- Nội dung Việt hóa hoàn toàn
- Nhân vật hoạt hình cute
- Offline mode
- Parent dashboard`,
    },
    {
      title: 'Marketplace gia sư online đáng tin cậy',
      description: `## Vấn đề
Khó tìm gia sư chất lượng, thiếu cơ chế đánh giá và bảo vệ học viên.

## Giải pháp
Nền tảng kết nối gia sư - học viên:
- Xác minh bằng cấp gia sư
- Đánh giá từ học viên thật
- Thanh toán qua app
- Bảo hiểm hoàn tiền

## Tính năng
- Video profile gia sư
- Trial lesson
- Lịch học tích hợp
- Chat và video call trong app`,
    },
    {
      title: 'App flashcard thông minh cho học sinh Việt',
      description: `## Vấn đề
Học sinh Việt học thuộc nhiều nhưng thiếu phương pháp hiệu quả.

## Giải pháp
Flashcard app với spaced repetition:
- Thuật toán ôn tập thông minh
- Bộ thẻ theo sách giáo khoa
- Tạo thẻ từ ảnh (OCR)
- Chia sẻ bộ thẻ với bạn bè

## Tính năng
- Dark mode cho mắt
- Offline mode
- Statistics chi tiết
- Thi đấu với classmates`,
    },
  ],
};

// Helper function to get random items from array
function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Generate unique titles by adding variations
function generateVariation(idea: { title: string; description: string }, index: number): { title: string; description: string } {
  const prefixes = ['', 'Super ', 'Smart ', 'Pro ', 'Mini ', 'Mega '];
  const suffixes = ['', ' 2.0', ' Plus', ' Pro', ' Lite', ' Max'];

  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[Math.floor(index / prefixes.length) % suffixes.length];

  return {
    title: `${prefix}${idea.title}${suffix}`.trim(),
    description: idea.description,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow if no secret configured (development) or secret matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse('Unauthorized', 401);
    }

    const supabase = createServerClient();

    // 1. Find or create Mr Idea user
    let { data: mrIdea, error: mrIdeaError } = await supabase
      .from('users')
      .select('id')
      .eq('email', MR_IDEA_USER.email)
      .single();

    if (mrIdeaError && mrIdeaError.code !== 'PGRST116') {
      console.error('Error fetching Mr Idea user:', mrIdeaError);
    }

    if (!mrIdea) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: MR_IDEA_USER.email,
          name: MR_IDEA_USER.name,
          image: MR_IDEA_USER.image,
          role: 'user',
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating Mr Idea user:', createError);
        return errorResponse(`Không thể tạo user Mr Idea: ${createError.message}`, 500);
      }
      mrIdea = newUser;
    }

    // 2. Get all categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug, name');

    if (catError) {
      console.error('Error fetching categories:', catError);
      return errorResponse(`Lỗi lấy categories: ${catError.message}`, 500);
    }

    if (!categories || categories.length === 0) {
      return errorResponse('Chưa có categories. Vui lòng chạy seed data trước.', 500);
    }

    // Create category map
    const categoryMap: Record<string, string> = {};
    categories.forEach((cat: { id: string; slug: string }) => {
      categoryMap[cat.slug] = cat.id;
    });

    // Check which categories are available
    const requiredCategories = ['tools', 'apps', 'games', 'business', 'design', 'education'];
    const missingCategories = requiredCategories.filter(slug => !categoryMap[slug]);

    if (missingCategories.length > 0) {
      // Try to create missing categories
      const categoryDefaults: Record<string, { name: string; icon: string; color: string }> = {
        tools: { name: 'Công cụ', icon: '🔧', color: '#3B82F6' },
        apps: { name: 'Ứng dụng', icon: '📱', color: '#10B981' },
        games: { name: 'Trò chơi', icon: '🎮', color: '#8B5CF6' },
        business: { name: 'Kinh doanh', icon: '💼', color: '#F59E0B' },
        design: { name: 'Thiết kế', icon: '🎨', color: '#EC4899' },
        education: { name: 'Giáo dục', icon: '📚', color: '#06B6D4' },
      };

      for (const slug of missingCategories) {
        const catData = categoryDefaults[slug];
        if (catData) {
          const { data: newCat, error: insertCatError } = await supabase
            .from('categories')
            .insert({ slug, ...catData })
            .select('id')
            .single();

          if (!insertCatError && newCat) {
            categoryMap[slug] = newCat.id;
          }
        }
      }
    }

    // 3. Generate ideas
    const ideasToCreate: Array<{
      title: string;
      description: string;
      category_id: string;
      user_id: string;
      status: 'approved';
      vote_count: number;
    }> = [];

    const allCategoryKeys = Object.keys(IDEA_TEMPLATES) as Array<keyof typeof IDEA_TEMPLATES>;

    // Select ideas from each category to reach 10 total
    let ideaIndex = 0;
    for (let i = 0; i < 10; i++) {
      const categoryKey = allCategoryKeys[i % allCategoryKeys.length];
      const templates = IDEA_TEMPLATES[categoryKey];
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Map category key to actual category ID
      const categoryId = categoryMap[categoryKey];
      if (!categoryId) continue;

      // Generate variation to avoid duplicates
      const variation = generateVariation(template, ideaIndex++);

      // Random initial votes (0-50)
      const initialVotes = Math.floor(Math.random() * 51);

      ideasToCreate.push({
        title: variation.title,
        description: variation.description,
        category_id: categoryId,
        user_id: mrIdea!.id,
        status: 'approved',
        vote_count: initialVotes,
      });
    }

    // 4. Insert ideas
    if (ideasToCreate.length === 0) {
      return errorResponse('Không có ý tưởng nào được tạo - kiểm tra lại categories', 400);
    }

    const { data: createdIdeas, error: insertError } = await supabase
      .from('ideas')
      .insert(ideasToCreate)
      .select('id, title');

    if (insertError) {
      console.error('Error inserting ideas:', insertError);
      return errorResponse(`Lỗi tạo ý tưởng: ${insertError.message}`, 500);
    }

    return successResponse({
      success: true,
      message: `Đã tạo ${createdIdeas?.length || 0} ý tưởng mới`,
      ideas: createdIdeas?.map((i: { id: string; title: string }) => ({ id: i.id, title: i.title })),
      generatedBy: MR_IDEA_USER.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in auto-generate ideas:', error);
    return errorResponse(`Lỗi hệ thống: ${error instanceof Error ? error.message : 'Unknown'}`, 500);
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
