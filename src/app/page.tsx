"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AiTab from "@/components/calculator/ai-tab";
import SmartTab from "@/components/calculator/smart-tab";
import BasicTab from "@/components/calculator/basic-tab";
import ScientificTab from "@/components/calculator/scientific-tab";
import MatrixTab from "@/components/calculator/matrix-tab";
import PolynomialTab from "@/components/calculator/polynomial-tab";
import { BrainCircuit, Calculator, Sigma, FunctionSquare, Bot, Variable } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="font-headline text-5xl font-bold text-primary">PiGoAt</h1>
          <p className="text-muted-foreground mt-2">The intelligent calculator for every need.</p>
        </header>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
            <TabsTrigger value="ai"><BrainCircuit className="w-4 h-4 mr-2"/>AI</TabsTrigger>
            <TabsTrigger value="smart"><Bot className="w-4 h-4 mr-2"/>Smart</TabsTrigger>
            <TabsTrigger value="basic"><Calculator className="w-4 h-4 mr-2"/>Basic</TabsTrigger>
            <TabsTrigger value="scientific"><Sigma className="w-4 h-4 mr-2"/>Scientific</TabsTrigger>
            <TabsTrigger value="matrix"><Variable className="w-4 h-4 mr-2"/>Matrix</TabsTrigger>
            <TabsTrigger value="polynomial"><FunctionSquare className="w-4 h-4 mr-2"/>Polynomial</TabsTrigger>
          </TabsList>
          
          <Card className="mt-4 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <TabsContent value="ai"><AiTab /></TabsContent>
              <TabsContent value="smart"><SmartTab /></TabsContent>
              <TabsContent value="basic"><BasicTab /></TabsContent>
              <TabsContent value="scientific"><ScientificTab /></TabsContent>
              <TabsContent value="matrix"><MatrixTab /></TabsContent>
              <TabsContent value="polynomial"><PolynomialTab /></TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </main>
  );
}
