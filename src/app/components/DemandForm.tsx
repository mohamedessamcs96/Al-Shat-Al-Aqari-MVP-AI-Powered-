"use client";

import * as React from "react";
import { Phone, CheckCircle, AlertCircle, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import mockApi from "../lib/mock-api";
import { mockCities } from "../lib/mock-data";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

export function DemandForm() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<"form" | "otp" | "success">("form");
  const [buyerName, setBuyerName] = React.useState("");
  const [cityId, setCityId] = React.useState(mockCities[0]?.id || "1");
  const [budgetMin, setBudgetMin] = React.useState("");
  const [budgetMax, setBudgetMax] = React.useState("");
  const [propertyType, setPropertyType] = React.useState("");
  const [bedroomsMin, setBedroomsMin] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [createdDemandId, setCreatedDemandId] = React.useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError("رقم الهاتف مطلوب");
      return;
    }
    if (!buyerName.trim()) {
      setError("الاسم مطلوب");
      return;
    }
    mockApi.sendOtp(phone);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp.trim()) {
      setError("أدخل رمز التحقق");
      return;
    }
    const res = mockApi.verifyOtp(phone, otp);
    if (!res.ok) {
      setError(`فشل التحقق: ${res.reason === "expired" ? "انتهت صلاحية الرمز" : "الرمز غير صحيح"}`);
      return;
    }
    // Proceed to create demand
    const demand = mockApi.createDemand({
      buyer_name: buyerName,
      city_id: cityId,
      budget_min: budgetMin ? Number(budgetMin) : 0,
      budget_max: budgetMax ? Number(budgetMax) : 0,
      property_type: propertyType || "أي نوع",
      bedrooms_min: bedroomsMin ? Number(bedroomsMin) : 0,
      intent_level: "serious",
      validation_status: "validated",
      notes,
    } as any);
    setCreatedDemandId(demand.id);
    setStep("success");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between" dir="ltr">
          <Button variant="ghost" onClick={() => navigate('/chat')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            رجوع
          </Button>
          <div dir="rtl">
            <h1 className="text-xl font-bold text-gray-900">اطلب عقارك</h1>
            <p className="text-sm text-gray-500">نموذج طلب عقار مخصص</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <LogOut className="w-4 h-4 mr-2" />
            خروج
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {step === "form" && (
            <Card className="p-6 bg-white shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900" dir="rtl">
                أخبرنا عن العقار الذي تبحث عنه
              </h2>

              <form onSubmit={handleSendOtp} className="space-y-5" dir="rtl">
                {/* Name */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">اسمك</Label>
                  <Input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    className="w-full"
                  />
                </div>

                {/* City */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">المدينة</Label>
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {mockCities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للميزانية</Label>
                    <Input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="من"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى للميزانية</Label>
                    <Input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="إلى"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Property Type & Bedrooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">نوع العقار</Label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">اختر نوعاً</option>
                      <option value="Villa">فيلا</option>
                      <option value="Apartment">شقة</option>
                      <option value="Duplex">دوبلكس</option>
                      <option value="Land">أرض</option>
                    </select>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">عدد الغرف (الحد الأدنى)</Label>
                    <Input
                      type="number"
                      value={bedroomsMin}
                      onChange={(e) => setBedroomsMin(e.target.value)}
                      placeholder="3+"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="شارك أي متطلبات إضافية..."
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-24"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 50 XXX XXXX"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">سيتم استخدام رقمك للتحقق والتواصل</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                >
                  إرسال الطلب والتحقق
                </Button>
              </form>
            </Card>
          )}

          {step === "otp" && (
            <Card className="p-6 bg-white shadow-lg">
              <div className="text-center mb-6" dir="rtl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">التحقق من الهاتف</h2>
                <p className="text-sm text-gray-600">أدخل الرمز المرسل إلى {phone}</p>
              </div>

              <div className="space-y-6" dir="rtl">
                {/* OTP Input */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-4 text-center">أدخل الرمز</Label>
                  <div className="flex justify-center mb-4">
                    <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                >
                  التحقق وإرسال الطلب
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  لم تستقبل رمزاً؟ تحقق من وحدة التحكم في متصفحك (مرحلة التطوير)
                </p>
              </div>
            </Card>
          )}

          {step === "success" && (
            <Card className="p-8 bg-white shadow-lg text-center" dir="rtl">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">تم استقبال طلبك!</h2>
              <p className="text-gray-700 mb-4">
                شكراً لاستخدامك الشات العقاري. سيتم توزيع طلبك حصراً على المكاتب العقارية المشتركة في الخطة المدفوعة.
              </p>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-6 inline-block">
                معرف الطلب: {createdDemandId}
              </Badge>
              <p className="text-sm text-gray-600 mb-6">
                ستتلقى ردود من المكاتب العقارية قريباً على رقم الجوال المسجل.
              </p>
              <Button
                onClick={() => navigate('/chat')}
                variant="outline"
                className="px-6 py-2"
              >
                العودة إلى البحث
              </Button>
              <Button
                onClick={() => {
                  setStep("form");
                  setBuyerName("");
                  setBudgetMin("");
                  setBudgetMax("");
                  setPropertyType("");
                  setBedroomsMin("");
                  setNotes("");
                  setPhone("");
                  setOtp("");
                  setError(null);
                  setCreatedDemandId(null);
                }}
                className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2"
              >
                طلب جديد
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
