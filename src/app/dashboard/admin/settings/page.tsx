"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { mockServices } from "@/lib/mock/data/services";
import { formatCurrency } from "@/lib/utils";
import { Settings, Building, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const { t } = useTranslation();

  // Service states
  const [services, setServices] = useState(
    mockServices.map((s) => ({
      ...s,
      editName: s.name,
      editDescription: s.description,
      editPrice: s.priceBDT,
      editIsOnline: s.isOnline,
      editIsOffline: s.isOffline,
      editIsActive: s.isActive,
      editMinCups: s.hijamaPricing?.minCups ?? 3,
      editPricePerCup: s.hijamaPricing?.pricePerCup ?? 200,
      editOnlinePrice: s.modePricing?.onlinePriceBDT ?? s.priceBDT,
      editOfflinePrice: s.modePricing?.offlinePriceBDT ?? s.priceBDT,
      editOnlineDuration: s.modePricing?.onlineDurationMinutes ?? s.durationMinutes,
      editOfflineDuration: s.modePricing?.offlineDurationMinutes ?? s.durationMinutes,
    }))
  );

  // Center info state
  const [centerInfo, setCenterInfo] = useState({
    name: "Sunnah Cure Diagnostic Center",
    address: "123 Healing Street, Dhanmondi, Dhaka, Bangladesh",
    phone: "+880 1234-567890",
    hours: "Saturday - Thursday: 9:00 AM - 9:00 PM",
  });

  const updateService = (
    index: number,
    field: string,
    value: string | number | boolean
  ) => {
    setServices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div>
      <PageHeader
        title={t.dashboard.sidebar.settings}
        description="Manage services and center information"
      />

      {/* Service Management */}
      <div className="space-y-6 mb-8">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Service Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${service.id}`} className="text-sm">
                      Active
                    </Label>
                    <Switch
                      id={`active-${service.id}`}
                      checked={service.editIsActive}
                      onCheckedChange={(checked) =>
                        updateService(index, "editIsActive", checked)
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Service Name</Label>
                  <Input
                    value={service.editName}
                    onChange={(e) =>
                      updateService(index, "editName", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={service.editDescription}
                    onChange={(e) =>
                      updateService(index, "editDescription", e.target.value)
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {service.type === "hijama" ? (
                  <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                    <Label className="text-sm font-semibold">Cup-Based Pricing</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Minimum Cups</Label>
                        <Input
                          type="number"
                          min={1}
                          value={service.editMinCups}
                          onChange={(e) =>
                            updateService(
                              index,
                              "editMinCups",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price per Cup (BDT)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={service.editPricePerCup}
                          onChange={(e) =>
                            updateService(
                              index,
                              "editPricePerCup",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Base price: {formatCurrency(service.editMinCups * service.editPricePerCup)} ({service.editMinCups} cups &times; {formatCurrency(service.editPricePerCup)})
                    </p>
                  </div>
                ) : service.editIsOnline && service.editIsOffline ? (
                  <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                    <Label className="text-sm font-semibold">Mode-Based Pricing</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Offline Price (BDT)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={service.editOfflinePrice}
                          onChange={(e) =>
                            updateService(index, "editOfflinePrice", parseInt(e.target.value) || 0)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Online Price (BDT)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={service.editOnlinePrice}
                          onChange={(e) =>
                            updateService(index, "editOnlinePrice", parseInt(e.target.value) || 0)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Offline Duration (min)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={service.editOfflineDuration}
                          onChange={(e) =>
                            updateService(index, "editOfflineDuration", parseInt(e.target.value) || 1)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Online Duration (min)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={service.editOnlineDuration}
                          onChange={(e) =>
                            updateService(index, "editOnlineDuration", parseInt(e.target.value) || 1)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label>Price (BDT)</Label>
                    <Input
                      type="number"
                      value={service.editPrice}
                      onChange={(e) =>
                        updateService(
                          index,
                          "editPrice",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`online-${service.id}`}
                      checked={service.editIsOnline}
                      onCheckedChange={(checked) =>
                        updateService(index, "editIsOnline", checked)
                      }
                    />
                    <Label htmlFor={`online-${service.id}`}>
                      {t.status.online}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`offline-${service.id}`}
                      checked={service.editIsOffline}
                      onCheckedChange={(checked) =>
                        updateService(index, "editIsOffline", checked)
                      }
                    />
                    <Label htmlFor={`offline-${service.id}`}>
                      {t.status.offline}
                    </Label>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                  <span>
                    {service.type === "hijama" && service.hijamaPricing
                      ? `From ${formatCurrency(service.hijamaPricing.minCups * service.hijamaPricing.pricePerCup)}`
                      : `Current price: ${formatCurrency(service.priceBDT)}`}
                  </span>
                  <span>{service.durationMinutes} min</span>
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    toast.success(`${service.editName} settings saved successfully.`);
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t.common.save}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Center Info */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building className="h-5 w-5" />
          Center Information
        </h2>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Center Name</Label>
                <Input
                  value={centerInfo.name}
                  onChange={(e) =>
                    setCenterInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t.appointments.phone}</Label>
                <Input
                  value={centerInfo.phone}
                  onChange={(e) =>
                    setCenterInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>{t.auth.register.addressLabel}</Label>
              <Textarea
                value={centerInfo.address}
                onChange={(e) =>
                  setCenterInfo((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label>Operating Hours</Label>
              <Input
                value={centerInfo.hours}
                onChange={(e) =>
                  setCenterInfo((prev) => ({
                    ...prev,
                    hours: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>

            <Button
              onClick={() => {
                toast.success("Center information saved successfully.");
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              {t.common.save}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
