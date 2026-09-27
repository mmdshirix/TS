"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Code, Globe, Settings, CheckCircle } from "lucide-react"

export default function EmbedPage() {
  const [domain, setDomain] = useState("example.com")
  const [position, setPosition] = useState("bottom-right")
  const [showOnMobile, setShowOnMobile] = useState(true)
  const [autoOpen, setAutoOpen] = useState(false)
  const [delay, setDelay] = useState("3")
  const [copied, setCopied] = useState(false)

  const generateEmbedCode = () => {
    return `<!-- کد امبد چت‌بات -->
<script>
  window.ChatbotConfig = {
    chatbotId: "1",
    position: "${position}",
    showOnMobile: ${showOnMobile},
    autoOpen: ${autoOpen},
    delay: ${delay}000,
    domain: "${domain}"
  };
</script>
<script src="https://cdn.chatbot.com/widget.js" async></script>
<noscript>
  <p>برای استفاده از چت‌بات، لطفاً JavaScript را فعال کنید.</p>
</noscript>`
  }

  const generateWordPressCode = () => {
    return `<?php
// اضافه کردن چت‌بات به وردپرس
function add_chatbot_widget() {
    ?>
    <script>
      window.ChatbotConfig = {
        chatbotId: "1",
        position: "<?php echo '${position}'; ?>",
        showOnMobile: <?php echo '${showOnMobile}' ? 'true' : 'false'; ?>,
        autoOpen: <?php echo '${autoOpen}' ? 'true' : 'false'; ?>,
        delay: <?php echo '${delay}'; ?>000
      };
    </script>
    <script src="https://cdn.chatbot.com/widget.js" async></script>
    <?php
}
add_action('wp_footer', 'add_chatbot_widget');
?>`
  }

  const generateReactCode = () => {
    return `import { useEffect } from 'react';

const ChatbotWidget = () => {
  useEffect(() => {
    // تنظیمات چت‌بات
    window.ChatbotConfig = {
      chatbotId: "1",
      position: "${position}",
      showOnMobile: ${showOnMobile},
      autoOpen: ${autoOpen},
      delay: ${delay}000
    };

    // بارگذاری اسکریپت چت‌بات
    const script = document.createElement('script');
    script.src = 'https://cdn.chatbot.com/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // پاک کردن اسکریپت هنگام unmount
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default ChatbotWidget;`
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">کد امبد چت‌بات</h1>
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="ml-1 h-3 w-3" />
          آماده نصب
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                تنظیمات امبد
              </CardTitle>
              <CardDescription>تنظیمات نمایش چت‌بات را تنظیم کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domain">دامنه وب‌سایت</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                />
              </div>

              <div>
                <Label htmlFor="position">موقعیت چت‌بات</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">پایین راست</SelectItem>
                    <SelectItem value="bottom-left">پایین چپ</SelectItem>
                    <SelectItem value="top-right">بالا راست</SelectItem>
                    <SelectItem value="top-left">بالا چپ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="mobile">نمایش در موبایل</Label>
                <Switch id="mobile" checked={showOnMobile} onCheckedChange={setShowOnMobile} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-open">باز شدن خودکار</Label>
                <Switch id="auto-open" checked={autoOpen} onCheckedChange={setAutoOpen} />
              </div>

              {autoOpen && (
                <div>
                  <Label htmlFor="delay">تاخیر (ثانیه)</Label>
                  <Select value={delay} onValueChange={setDelay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">بدون تاخیر</SelectItem>
                      <SelectItem value="3">3 ثانیه</SelectItem>
                      <SelectItem value="5">5 ثانیه</SelectItem>
                      <SelectItem value="10">10 ثانیه</SelectItem>
                      <SelectItem value="30">30 ثانیه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Code Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="html" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="wordpress" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                WordPress
              </TabsTrigger>
              <TabsTrigger value="react" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                React
              </TabsTrigger>
            </TabsList>

            <TabsContent value="html">
              <Card>
                <CardHeader>
                  <CardTitle>کد HTML</CardTitle>
                  <CardDescription>این کد را قبل از تگ {"</body>"} در صفحات وب‌سایت خود قرار دهید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea value={generateEmbedCode()} readOnly className="font-mono text-sm min-h-[200px]" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(generateEmbedCode())}>
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "کپی شد!" : "کپی"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(generateEmbedCode(), "chatbot-embed.html")}
                      >
                        <Download className="h-4 w-4" />
                        دانلود
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wordpress">
              <Card>
                <CardHeader>
                  <CardTitle>کد WordPress</CardTitle>
                  <CardDescription>این کد را در فایل functions.php قالب وردپرس خود اضافه کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea value={generateWordPressCode()} readOnly className="font-mono text-sm min-h-[200px]" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(generateWordPressCode())}>
                        <Copy className="h-4 w-4" />
                        کپی
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(generateWordPressCode(), "chatbot-wordpress.php")}
                      >
                        <Download className="h-4 w-4" />
                        دانلود
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="react">
              <Card>
                <CardHeader>
                  <CardTitle>کامپوننت React</CardTitle>
                  <CardDescription>این کامپوننت را در اپلیکیشن React خود import و استفاده کنید</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea value={generateReactCode()} readOnly className="font-mono text-sm min-h-[200px]" />
                    <div className="absolute top-2 left-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(generateReactCode())}>
                        <Copy className="h-4 w-4" />
                        کپی
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(generateReactCode(), "ChatbotWidget.jsx")}
                      >
                        <Download className="h-4 w-4" />
                        دانلود
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>راهنمای نصب</CardTitle>
          <CardDescription>مراحل نصب چت‌بات در وب‌سایت خود را دنبال کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">تنظیمات را انجام دهید</h3>
              <p className="text-sm text-gray-600">موقعیت، رنگ و سایر تنظیمات چت‌بات را مطابق نیاز خود تنظیم کنید</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">کد را کپی کنید</h3>
              <p className="text-sm text-gray-600">کد مربوط به پلتفرم خود (HTML، WordPress یا React) را کپی کنید</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">در سایت قرار دهید</h3>
              <p className="text-sm text-gray-600">کد را در محل مناسب وب‌سایت خود قرار دهید و تست کنید</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Verification */}
      <Card>
        <CardHeader>
          <CardTitle>تأیید دامنه</CardTitle>
          <CardDescription>دامنه‌هایی که مجاز به استفاده از چت‌بات هستند</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">{domain}</span>
                <Badge variant="default">فعال</Badge>
              </div>
              <Button variant="outline" size="sm">
                ویرایش
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input placeholder="دامنه جدید اضافه کنید" />
              <Button>افزودن</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
