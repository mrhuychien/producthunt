'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Gift,
  TrendingUp,
  Users,
  Banknote,
  Shield,
  Zap,
  Award,
  ArrowRight,
  Loader2,
  Heart,
  Code,
  Rocket
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, Button, Badge } from '@/components/ui';

interface IdeaWithBounty {
  id: string;
  title: string;
  description: string;
  voteCount: number;
  totalBounty: number;
  backerCount: number;
  category?: {
    name: string;
    icon: string;
  };
  user?: {
    name: string;
    image: string | null;
  };
}

interface BountyStats {
  totalBounty: number;
  totalIdeas: number;
  totalBackers: number;
  averageBounty: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + '₫';
}

export default function BountyPage() {
  const [ideas, setIdeas] = useState<IdeaWithBounty[]>([]);
  const [stats, setStats] = useState<BountyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBountyData();
  }, []);

  const fetchBountyData = async () => {
    try {
      const response = await fetch('/api/bounty/stats');
      const data = await response.json();

      if (data.success) {
        setIdeas(data.data.topIdeas || []);
        setStats(data.data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching bounty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Gift,
      title: 'Cam kết hỗ trợ',
      description: 'Pledge số tiền bạn sẵn sàng đóng góp khi ý tưởng được xây dựng thành công.'
    },
    {
      icon: Shield,
      title: 'An toàn & Minh bạch',
      description: 'Tiền chỉ được thanh toán khi sản phẩm hoàn thành. Bạn có thể hủy pledge bất cứ lúc nào.'
    },
    {
      icon: Zap,
      title: 'Thúc đẩy hành động',
      description: 'Bounty Pool lớn thu hút developer và tăng cơ hội ý tưởng được xây dựng.'
    },
    {
      icon: Award,
      title: 'Phần thưởng xứng đáng',
      description: 'Developer hoàn thành dự án sẽ nhận được toàn bộ số tiền Bounty Pool.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Heart,
      title: 'Tìm ý tưởng yêu thích',
      description: 'Duyệt qua các ý tưởng và chọn những ý tưởng bạn muốn thấy thành hiện thực.'
    },
    {
      step: 2,
      icon: Banknote,
      title: 'Pledge Bounty',
      description: 'Cam kết số tiền bạn muốn hỗ trợ (tối thiểu 10.000₫). Tiền chưa bị trừ ngay.'
    },
    {
      step: 3,
      icon: Code,
      title: 'Developer nhận việc',
      description: 'Khi Bounty Pool đủ hấp dẫn, developer sẽ claim và bắt đầu xây dựng.'
    },
    {
      step: 4,
      icon: Rocket,
      title: 'Sản phẩm ra đời',
      description: 'Khi hoàn thành, bounty được chuyển cho developer và bạn có sản phẩm mới!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full mb-6"
          >
            <Gift className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">Micro-Bounty System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Biến ý tưởng thành{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
              hiện thực
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Hỗ trợ tài chính cho các ý tưởng bạn muốn thấy được xây dựng.
            Cùng cộng đồng đóng góp Bounty Pool để thu hút developer tài năng.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/ideas">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                <Gift className="w-5 h-5 mr-2" />
                Pledge ngay
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                Đăng ý tưởng mới
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-12 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm"
              >
                <Banknote className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalBounty)}</p>
                <p className="text-sm text-gray-600">Tổng Bounty Pool</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm"
              >
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">{stats.totalIdeas}</p>
                <p className="text-sm text-gray-600">Ý tưởng có bounty</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm"
              >
                <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">{stats.totalBackers}</p>
                <p className="text-sm text-gray-600">Người hỗ trợ</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm"
              >
                <Award className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.averageBounty)}</p>
                <p className="text-sm text-gray-600">Trung bình/ý tưởng</p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại sao chọn Bounty Pool?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hệ thống Micro-Bounty giúp kết nối người có ý tưởng với developer,
              tạo động lực tài chính để biến ý tưởng thành sản phẩm thực.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-green-100 rounded-xl w-fit mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cách thức hoạt động</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chỉ với 4 bước đơn giản, bạn có thể hỗ trợ ý tưởng yêu thích được xây dựng
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-green-200" />
                )}
                <div className="relative bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Bounty Ideas Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Bounty Pool</h2>
              <p className="text-gray-600">Các ý tưởng có bounty cao nhất đang chờ developer</p>
            </div>
            <Link href="/ideas?sort=bounty">
              <Button variant="outline" className="hidden md:flex">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : ideas.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/ideas/${idea.id}`}>
                    <Card className="p-6 h-full bg-white hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {idea.category?.icon} {idea.category?.name}
                        </Badge>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                          <Banknote className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(idea.totalBounty)}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {idea.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {idea.user?.image && (
                            <img
                              src={idea.user.image}
                              alt={idea.user.name}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <span className="text-xs text-gray-500">{idea.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {idea.backerCount} backers
                          </span>
                          <span>▲ {idea.voteCount}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center bg-white">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bounty nào</h3>
              <p className="text-gray-600 mb-6">
                Hãy là người đầu tiên pledge bounty cho ý tưởng yêu thích!
              </p>
              <Link href="/ideas">
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  Khám phá ý tưởng
                </Button>
              </Link>
            </Card>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/ideas?sort=bounty">
              <Button variant="outline">
                Xem tất cả ý tưởng có bounty
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-500 to-emerald-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <Gift className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng hỗ trợ ý tưởng?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Mỗi đóng góp nhỏ của bạn đều có ý nghĩa. Cùng nhau, chúng ta có thể biến
            những ý tưởng tuyệt vời thành sản phẩm thực sự phục vụ cộng đồng.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/ideas">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                <Gift className="w-5 h-5 mr-2" />
                Bắt đầu pledge
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Chia sẻ ý tưởng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Câu hỏi thường gặp</h2>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-2">Pledge bounty có mất tiền ngay không?</h3>
              <p className="text-gray-600">
                Không. Khi bạn pledge, đó chỉ là cam kết. Tiền chỉ được thanh toán khi ý tưởng được
                xây dựng hoàn chỉnh bởi một developer. Bạn có thể hủy pledge bất cứ lúc nào trước khi dự án hoàn thành.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-2">Số tiền tối thiểu để pledge là bao nhiêu?</h3>
              <p className="text-gray-600">
                Bạn có thể pledge từ 10.000₫ trở lên. Mọi đóng góp đều có giá trị và giúp tăng
                tổng Bounty Pool, thu hút developer quan tâm đến ý tưởng.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-2">Developer nhận bounty như thế nào?</h3>
              <p className="text-gray-600">
                Khi một developer hoàn thành việc xây dựng sản phẩm và được cộng đồng xác nhận,
                toàn bộ Bounty Pool sẽ được chuyển cho developer đó như phần thưởng xứng đáng.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-2">Tôi có thể pledge cho ý tưởng của mình không?</h3>
              <p className="text-gray-600">
                Có! Bạn hoàn toàn có thể pledge cho ý tưởng của chính mình để tăng tính hấp dẫn
                và thu hút developer. Đây là cách thể hiện sự cam kết với ý tưởng của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
