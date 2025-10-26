"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/core/shadcn/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/shadcn/components/ui/form";
import { Input } from "@/core/shadcn/components/ui/input";
import { Textarea } from "@/core/shadcn/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shadcn/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/shadcn/components/ui/card";
import { Separator } from "@/core/shadcn/components/ui/separator";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_OPTIONS,
} from "@/core/constants/article";
import { Switch } from "@/core/shadcn/components/ui/switch";
import { CreateArticleResponse } from "@/app/api/article/route";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(120, "제목은 120자 이하로 입력해주세요."),
  category: z.string().min(1, "카테고리를 선택해주세요."),
  content: z
    .string()
    .min(1, "내용을 입력해주세요.")
    .max(5000, "내용은 5000자 이하로 입력해주세요."),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function ArticleEditorForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: ARTICLE_CATEGORIES.FREE,
      content: "",
      isPublic: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = (await response.json().catch(() => null)) as
        | CreateArticleResponse
        | null;

      if (!response.ok) {
        const message =
          result?.error ?? "게시글 생성에 실패했습니다.";
        throw new Error(message);
      }

      const destination =
        result?.redirectTo ??
        (result?.article?.id
          ? `/article/${result.article.id}`
          : "/article");

      router.push(destination);
      router.refresh();
    } catch (error) {
      console.error(error);
      form.setError("root", {
        type: "server",
        message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-10">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">게시글 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input placeholder="제목을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel className="whitespace-nowrap">카테고리</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className="min-w-[200px]">
                          <SelectTrigger>
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ARTICLE_CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="내용을 입력하세요"
                        className="min-h-[260px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel className="whitespace-nowrap">
                        공개 여부
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label="공개 여부"
                          />
                          <span className="text-sm text-muted-foreground">
                            {field.value ? "공개" : "비공개"}
                          </span>
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Separator className="my-2" />

              <CardFooter className="flex flex-col gap-3 px-0">
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "제출 중..." : "제출"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  취소
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
