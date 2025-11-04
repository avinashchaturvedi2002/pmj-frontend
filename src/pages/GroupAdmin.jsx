import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poolingService, packageService } from '../services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import RazorpayCheckout from '../components/RazorpayCheckout';
import { 
  Users, 
  IndianRupee, 
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Loader,
  AlertTriangle,
  Package,
  Bus,
  Hotel
} from 'lucide-react';
import { motion } from 'framer-motion';

const GroupAdmin = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Package selection
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [perPersonCost, setPerPersonCost] = useState('');
  const [paymentDeadline, setPaymentDeadline] = useState('');
  const [settingPackage, setSettingPackage] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch group details
      const { data: groupData } = await poolingService.getGroupById(groupId);
      setGroup(groupData.group);
      
      // Fetch payment status
      const { data: statusData } = await poolingService.checkGroupPaymentStatus(groupId);
      setPaymentStatus(statusData);
      
      // Fetch available packages if trip exists
      if (groupData.group.trip?.id) {
        try {
          const { data: packagesData } = await packageService.getSuggestions(groupData.group.trip.id);
          setPackages(packagesData.suggestions || []);
        } catch (err) {
          console.warn('Could not fetch packages:', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch group details:', err);
      setError(err.response?.data?.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPackage = async () => {
    if (!selectedPackageId || !perPersonCost || !paymentDeadline) {
      alert('Please fill all fields');
      return;
    }

    try {
      setSettingPackage(true);
      await poolingService.setGroupPackage(groupId, {
        packageId: selectedPackageId,
        perPersonCost: parseInt(perPersonCost),
        paymentDeadline
      });
      
      alert('Package set successfully! Members can now approve and pay.');
      fetchGroupDetails();
    } catch (err) {
      console.error('Failed to set package:', err);
      alert(err.response?.data?.message || 'Failed to set package');
    } finally {
      setSettingPackage(false);
    }
  };

  const handleLockGroup = async () => {
    if (!confirm('Are you sure you want to lock this group? This action cannot be undone.')) {
      return;
    }

    try {
      await poolingService.lockGroup(groupId);
      alert('Group locked successfully! Individual bookings have been created for all paid members.');
      fetchGroupDetails();
    } catch (err) {
      console.error('Failed to lock group:', err);
      alert(err.response?.data?.message || 'Failed to lock group');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PAYMENT_PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PAYMENT_FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      APPROVED: 'default',
      PAID: 'default',
      PENDING: 'outline',
      PAYMENT_PENDING: 'outline',
      PAYMENT_FAILED: 'destructive',
      REJECTED: 'destructive'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Group</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/pooling')}>Back to Pooling</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLocked = group?.status === 'LOCKED' || group?.status === 'CONFIRMED';
  const canLock = paymentStatus?.allApprovedMembersPaid && group?.selectedPackageId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Group Admin Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <Badge variant={group?.status === 'ACTIVE' ? 'default' : 'outline'}>
                  {group?.status}
                </Badge>
                {isLocked && <Lock className="h-4 w-4 text-gray-500" />}
              </div>
            </motion.div>
            <Button onClick={() => navigate('/pooling')} variant="outline">
              Back to Pooling
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Group Info and Package Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details */}
            {group?.trip && (
              <Card>
                <CardHeader>
                  <CardTitle>Trip Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{group.trip.source} → {group.trip.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>
                        {new Date(group.trip.startDate).toLocaleDateString()} - {new Date(group.trip.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      <span>Budget: ₹{group.trip.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Package Selection */}
            {!isLocked && packages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Set Group Package</CardTitle>
                  <CardDescription>
                    Select a package and set the per-person cost for the group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="package">Select Package</Label>
                      <select
                        id="package"
                        value={selectedPackageId}
                        onChange={(e) => {
                          setSelectedPackageId(e.target.value);
                          const pkg = packages.find(p => `${p.bus.id}-${p.hotel.id}` === e.target.value);
                          if (pkg) {
                            setPerPersonCost(pkg.pricing.perPersonCost.toString());
                          }
                        }}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                        disabled={settingPackage}
                      >
                        <option value="">Choose a package...</option>
                        {packages.map((pkg) => (
                          <option key={`${pkg.bus.id}-${pkg.hotel.id}`} value={`${pkg.bus.id}-${pkg.hotel.id}`}>
                            {pkg.bus.busName} + {pkg.hotel.name} - ₹{pkg.pricing.perPersonCost}/person
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="perPersonCost">Per Person Cost (₹)</Label>
                      <Input
                        id="perPersonCost"
                        type="number"
                        value={perPersonCost}
                        onChange={(e) => setPerPersonCost(e.target.value)}
                        placeholder="e.g., 5000"
                        disabled={settingPackage}
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentDeadline">Payment Deadline</Label>
                      <Input
                        id="paymentDeadline"
                        type="date"
                        value={paymentDeadline}
                        onChange={(e) => setPaymentDeadline(e.target.value)}
                        disabled={settingPackage}
                      />
                    </div>

                    <Button 
                      onClick={handleSetPackage} 
                      disabled={settingPackage || !selectedPackageId || !perPersonCost || !paymentDeadline}
                      className="w-full"
                    >
                      {settingPackage ? 'Setting Package...' : 'Set Package for Group'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Package Display */}
            {group?.selectedPackage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Selected Package</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Bus className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{group.selectedPackage.bus?.busName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {group.selectedPackage.bus?.busNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Hotel className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{group.selectedPackage.hotel?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {group.selectedPackage.hotel?.location}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Per Person Cost:</span>
                        <span className="text-xl text-primary">₹{group.perPersonCost?.toLocaleString()}</span>
                      </div>
                      {group.paymentDeadline && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Payment Deadline:</span>
                          <span className="text-sm font-medium">
                            {new Date(group.paymentDeadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Members and Payment Status */}
          <div className="space-y-6">
            {/* Payment Summary */}
            {paymentStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Members:</span>
                      <span className="font-semibold">{paymentStatus.totalMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Approved:</span>
                      <span className="font-semibold text-green-600">{paymentStatus.approvedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                      <span className="font-semibold text-blue-600">{paymentStatus.paidCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pending Payment:</span>
                      <span className="font-semibold text-yellow-600">{paymentStatus.paymentPendingCount}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Collected:</span>
                        <span className="text-lg text-primary">₹{paymentStatus.totalAmountCollected?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lock Group Button */}
            {!isLocked && canLock && (
              <Card className="border-green-500">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <h3 className="font-semibold">Ready to Lock</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All approved members have paid. You can now lock the group to create bookings.
                    </p>
                    <Button onClick={handleLockGroup} variant="default" className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Lock Group & Create Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLocked && (
              <Card className="border-blue-500">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <Lock className="h-12 w-12 text-blue-500 mx-auto" />
                    <h3 className="font-semibold">Group Locked</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Individual bookings have been created for all paid members.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Group Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentStatus?.members?.map((member, index) => (
                    <div key={member.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(member.paymentStatus || member.status)}
                        <div>
                          <p className="font-medium text-sm">{member.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{member.user?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(member.paymentStatus || member.status)}
                        {member.amountPaid > 0 && (
                          <p className="text-xs text-gray-500 mt-1">₹{member.amountPaid.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAdmin;


